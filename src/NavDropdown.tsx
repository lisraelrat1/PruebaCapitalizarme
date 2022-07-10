import axios from "axios";
import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment-timezone';
import { Chart } from './Chart';


const baseURL = "https://mindicador.cl/api";

const yearByIndicator = {
  "uf": "1997",
  "ivp": "1990",
  "dolar": "1984",
  "dolar_intercambio": "1988",
  "euro": "1999",
  "ipc": "1928",
  "utm": "1990",
  "imacec": "1997",
  "tpm": "2001",
  "libra_cobre": "2012", 
  "tasa_desempleo": "2009",
  "bitcoin": "2009"
}

const months = [{id: "1", nombre:'Enero'}, 
                {id: "2", nombre:'Febrero'}, 
                {id: "3", nombre:'Marzo'},
                {id: "4", nombre:'Abril'},
                {id: "5", nombre:'Mayo'},
                {id: "6", nombre:'Junio'},
                {id: "7", nombre:'Julio'},
                {id: "8", nombre:'Agosto'},
                {id: "9", nombre:'Septiembre'},
                {id: "10", nombre:'Octubre'},
                {id: "11", nombre:'Noviembre'},
                {id: "12", nombre:'Diciembre'}
              ]

type Indicator = {
    codigo: string;
    nombre: string;
    unidad_medida: string;
    fecha: Date;
    valor: number;
};


async function getYears( yearByIndicator: { [indicatorType: string] : string }, indicatorType: string): Promise<any> {
  try {

      const years = []
      const dateStart = moment(yearByIndicator[indicatorType]);
      const dateEnd = moment();

      while (dateEnd.diff(dateStart, 'years') >= 0) {
          years.push(dateStart.format('YYYY'))
          dateStart.add(1, 'year')
      }
      return years

  } catch (err) {
     console.log(err);
     return [];
  }
}

  
async function getIndicator(): Promise<Indicator[]> {
    try {
        const response = await axios.get(`${baseURL}/`);
        var indicators: Indicator[] = [];

        for (let k in yearByIndicator){
          indicators.push(response.data[k]);
        }
        return indicators;

    } catch (err) {
       console.log(err);
       return [];
    }
}

async function chartTitle(indicatorType: Indicator, year:string, month:string): Promise<string> {
  try {
      const title = `${indicatorType.nombre} de ${month} de ${year}`;
      return title;

  } catch (err) {
     console.log(err);
     return '';
  }
}

  
export default function NavDropdown() {
    const [indicators, setIndicators] = useState<[] | Indicator[]>([]);
    const [years, setYears] = useState<[]>([]);
    const [title, setTitle] = useState<string>('')

    const [selectedIndicator, setSelectedIndicator] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    

    useEffect(() => {
      (async () => {
        const indicators = await getIndicator();
        setIndicators(indicators);
        const years = await getYears(yearByIndicator, selectedIndicator);
        setYears(years);
        const title = await chartTitle(indicators.find(o => o.codigo===selectedIndicator)!, selectedYear , months.find(o => o.id === selectedMonth)!.nombre);
        setTitle(title);
      })();
    }, [selectedIndicator, selectedYear, selectedMonth]);

    const selectIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setSelectedIndicator(value);
    };

    const selectYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setSelectedYear(value);
    };
  
    const selectMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setSelectedMonth(value);
    };

    return (
      <>
        <Navbar bg="light" className='shadow-sm mb-5'>
          <Container className="d-flex justify-content-around">
            <Row className='mb-3'>
              <Col>
                <Form.Group controlId="indicador">
                  <Form.Label>Indicador</Form.Label>
                  <Form.Select size="lg" aria-label="Default select example" onChange={selectIndicatorChange}>
                    {indicators.map((i) => {
                      const {nombre, codigo} = i;
                      return <option value={codigo}>{nombre}</option>;
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="indicador">
                  <Form.Label>Año</Form.Label>
                  <Form.Select size="lg" onChange={selectYearChange}>
                      {years.map((i) => {
                      return <option value={i}>{i}</option>;
                      })}
                  </Form.Select>
                  </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="indicador">
                  <Form.Label>Mes</Form.Label>
                  <Form.Select size="lg" aria-label="Default select example" onChange={selectMonthChange}>
                    {months.map((i) => {
                      const {id, nombre} = i;
                      return <option value={id}>{nombre}</option>;
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Container>
        </Navbar>

        <Chart title={title} indicatorType={selectedIndicator} year={selectedYear} month={selectedMonth}/>
      </>
    );
  }

  

