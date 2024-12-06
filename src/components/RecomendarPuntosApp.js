import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { Input } from '@chakra-ui/react';

const center = {
  lat: -34.5994039,
  lng: -58.435489,
};

function RecomendarPuntosApp({
  radius,
  selectedLocation,
  setRadius,
  setSelectedLocation,
  puntos,
  setPuntos,
  setDireccion, // Permite actualizar la dirección en el buscador
}) {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [locations, setLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(15);
  const [selectingRadius, setSelectingRadius] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('https://heladeras-dds-back.onrender.com/ubicaciones-googlemaps');
        const data = await response.json();
        console.log(data);
        setLocations(data);
      } catch (error) {
        console.error('Error al obtener las ubicaciones:', error);
      }
    };

    fetchLocations();
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleMarkerClick = async (lat, lng) => {
    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.results && geocodeData.results.length > 0) {
        const address = geocodeData.results[0].formatted_address;
        setDireccion(address); // Actualiza la dirección en el buscador
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }
  };

  const handleMapClick = (event) => {
    if (!selectingRadius) {
      setSelectedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      setPuntos([]);
      setRadius(0);
      setSelectingRadius(true);
    } else {
      setSelectingRadius(false);
    }
  };

  function getDistance(center, point) {
    function toRadians(degrees) {
      return degrees * (Math.PI / 180);
    }

    if (selectingRadius) {
      const R = 6371000; // Radio de la tierra en metros
      const lat1 = toRadians(center.lat);
      const lon1 = toRadians(center.lng);
      const lat2 = toRadians(point.latLng.lat());
      const lon2 = toRadians(point.latLng.lng());

      const deltaLat = lat2 - lat1;
      const deltaLon = lon2 - lon1;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;

      setRadius(distance);
    }
  }

  const handleMovement = (event) => {
    getDistance(selectedLocation, event);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
        onMouseMove={handleMovement}
      >
        {/* Marca en el mapa las heladeras existentes */}
        {locations.map((location) => (
          <Marker
            key={location.nombre}
            position={{ lat: location.latitud, lng: location.longitud }}
          />
        ))}

        {/* Renderiza el círculo si se ha seleccionado un punto */}
        {selectedLocation && (
          <Circle
            center={selectedLocation}
            radius={radius}
            onClick={handleMapClick}
            onMouseMove={handleMovement}
          />
        )}

        {/* Marca los puntos recomendados en el mapa */}
        {puntos.map((punto) => (
          <Marker
            key={punto.nombre}
            position={{ lat: punto.latitud, lng: punto.longitud }}
            onClick={() => handleMarkerClick(punto.latitud, punto.longitud)}
          />
        ))}
      </GoogleMap>

      {selectedLocation && (
        <Input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          position="absolute"
          top="10px"
          right="10px"
          width="100px"
          border="1px solid #ccc"
          borderRadius="md"
        />
      )}
    </div>
  );
}

export default RecomendarPuntosApp;