import axios from "axios";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import moment from 'moment-timezone';

const baseURL = "https://mindicador.cl/api";

type ChartProps = {
    title: string,
    indicatorType: string;
    year: string;
    month: string;
}

type Serie = {
    fecha: string,
    valor: number;
}

async function filterTimeSeries(data: Serie[], month: string):  Promise<Serie[]>  {
    const result = data.filter((obj) => {
        return moment(obj.fecha).format('M') === month;
    });
    
    return result;
}


export const Chart = ({title, indicatorType, year, month}: ChartProps) => {

    const [x, setXData] = useState<string[]>([]);
    const [y, setYData] = useState<number[]>([]);

    const dataValue = async () => {
        const response  = await axios.get(`${ baseURL }/${indicatorType}/${year}`);
        const filtered = await filterTimeSeries(response.data.serie, month);

        setYData(filtered.map(({ valor }) => valor));
        setXData(filtered.map(({ fecha }) => fecha));  
    } 
  
    useEffect(() => {
        dataValue();
    }, [title, indicatorType, year, month]); 

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
        title: title
    };


    return (
        <div>
            <Plot data={data} layout={layout}/>
        </div>
    )
}
