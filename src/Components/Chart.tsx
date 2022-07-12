import axios, { AxiosError }  from "axios";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import moment from 'moment-timezone';
import Spinner from 'react-bootstrap/Spinner';


const baseURL = "https://mindicador.cl/api";

type ChartProps = {
    title: string;
    indicatorType: string;
    moneda: string;
    year: string;
    month: string;
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

type ServerError = { errorMessage: string };

const yearlyIndicators = ["tasa_desempleo", "imacec", "ipc", "utm"]

async function filterTimeSeries(data: Serie[], month: string):  Promise<Serie[]>  {
    const result = data.filter((obj) => {
        return moment(obj.fecha).format('M') === month;
    });
    
    return result;
}


export const Chart = ({title, indicatorType, moneda, year, month}: ChartProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [x, setXData] = useState<string[]>([]);
    const [y, setYData] = useState<number[]>([]);

    const dataValue = async () => {
        
        setIsLoading(true);

        try {
            const response  = await axios.get<SerieResponse>(`${ baseURL }/${indicatorType}/${year}`);
            const serie = response.data.serie;

            setIsLoading(false);
            setErrorMessage("");

            if ( yearlyIndicators.indexOf(indicatorType) > -1){
                setYData(serie.map(({ valor }) => valor));
                setXData(serie.map(({ fecha }) => fecha));
            }

            else{
                const filtered = await filterTimeSeries(serie, month);
                setYData(filtered.map(({ valor }) => valor));
                setXData(filtered.map(({ fecha }) => fecha));  
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverError = error as AxiosError<ServerError>;
                if (serverError && serverError.response) {
                  console.log(serverError.response.data);
                }
            }
            setIsLoading(false);
            console.log(error);
            setErrorMessage("Ha habido un error cargando los datos");
            
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
            {isLoading ? <Spinner animation="border" /> : <Plot data={data} layout={layout}/>}
            {errorMessage && <div className="error">{errorMessage}</div>}
        </div>
    )
}
