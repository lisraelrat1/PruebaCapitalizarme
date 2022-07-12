import axios, { AxiosError }  from "axios";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import moment from 'moment-timezone';
import ClipLoader from "react-spinners/ClipLoader";


const baseURL = "https://mindicador.cl/api";

type ChartProps = {
    title: string;
    indicatorType: string;
    moneda: string;
    year: string;
    month?: string;
}

type Serie = {
    fecha: string,
    valor: number
}

type SerieResponse = {
        version: string;
        autor: string;
        codigo: string;
        nombre: string;
        unidad_medida: string;
        serie: Array<Serie>;
}

type ServerError = { error: string;
                     message: string; 
                     description: string;
                };

const yearlyIndicators = ["tasa_desempleo", "imacec", "ipc", "utm"]

async function filterTimeSeries(data: Serie[], month: string):  Promise<Serie[]>  {
    const result = data.filter((obj) => {
        return moment(obj.fecha).format('M') === month;
    });
    
    return result;
}


export const Chart = ({title, indicatorType, moneda, year, month}: ChartProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<any>(null);

    const [x, setXData] = useState<string[]>([]);
    const [y, setYData] = useState<number[]>([]);

    const dataValue = async () => {
        
        setIsLoading(true);

        try {
            const response  = await axios.get<SerieResponse>(`${ baseURL }/${indicatorType}/${year}`);
            const serie = response.data.serie;

            setIsLoading(false);
            setErrorMessage(null);

            if (yearlyIndicators.includes(indicatorType)){
                setYData(serie.map(({ valor }) => valor));
                setXData(serie.map(({ fecha }) => fecha));
            }

            else{
                const filtered = await filterTimeSeries(serie, month!);
                setYData(filtered.map(({ valor }) => valor));
                setXData(filtered.map(({ fecha }) => fecha));  
            }

        } catch (error) {    
            if (axios.isAxiosError(error)) {
                setIsLoading(false);
                console.log(error);
                const serverError = error as AxiosError<ServerError>;
                if (serverError && serverError.response) {
                  setErrorMessage(serverError.response.data.message);
                }
            }
            else{
                setIsLoading(false);
                console.log(error);
            }
        }
    } 
  
    useEffect(() => {
        dataValue();
    }, [title, indicatorType, moneda, year, month, isLoading, errorMessage]); 

    const data = [
        {
          x: x,
          y: y,
          mode: "lines",
          marker: {color: '#00BCFF'}
        },
      ];

    const layout = { 
        width: 640,
        height: 480,
        title: title,
        yaxis: {
            title: {
                text: `Valor en ${moneda}`
            }
        }
    };

    return (
        <div>
            {isLoading ? <ClipLoader/> : <Plot data={data} layout={layout}/>}
            {errorMessage &&  <div className="error">{errorMessage}</div>}
        </div>
    )
}
