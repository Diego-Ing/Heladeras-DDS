import React, { useState} from "react";
import RecomendarPuntosApp from "../components/RecomendarPuntosApp";
import '../assets/styles/RecomendarPuntosPage.css';
import Button from 'react-bootstrap/Button';

function RecomendarPuntosPage() {

    const [puntos, setPuntos] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(0);


    const handleSubmit = async () => {        
        try {
            const response = await fetch('http://localhost:8080/heladeras/recomendarPuntos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitud: selectedLocation.lat,
                    longitud: selectedLocation.lng,
                    radio: radius,
                }),
            });
            const data = await response.json();
            console.log(data);
            setPuntos(data);
        } catch (error) {
            console.error('Error al obtener las recomendaciones:', error);
        }
    };

    return (
        <div className="recomendar-puntos-page">
            <div className="recomendador-container">
                <div className="container-puntos">
                    <p>Seleccione un área en el mapa y presione <b>Obtener recomendación</b></p>

                    <div className="lista-puntos">
                        {puntos.map((punto) => (
                            <div key={punto.nombre} className="punto">
                                <p>{punto.nombre}</p>
                                <p>Lat: {punto.latitud}</p>
                                <p>Long: {punto.longitud}</p>
                            </div>
                        ))}
                    </div>

                    <Button className="mt-1" onClick={handleSubmit}>
                        Obtener recomendación
                    </Button>
                </div>

                <div className="mapa">
                    <RecomendarPuntosApp 
                        radius={radius}
                        selectedLocation={selectedLocation}
                        setRadius={setRadius}
                        setSelectedLocation={setSelectedLocation}
                        puntos={puntos}
                        setPuntos={setPuntos}
                    />
                </div>
            </div>
        </div>
    );
}

export default RecomendarPuntosPage;