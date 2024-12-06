import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Text, Link, useToast } from '@chakra-ui/react';
import { useAuth } from '../config/authContext';
import { Autocomplete, LoadScript } from '@react-google-maps/api';

// Define las librerías fuera del componente
const libraries = ['places'];

const CargarHeladeraForm = () => {
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const colaboradorUUID = localStorage.getItem('sub');
  const { accessToken } = useAuth();
  const toast = useToast();
  const [autocomplete, setAutocomplete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        'https://heladeras-dds-back.onrender.com/colaboraciones/obtencion-heladera',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
          },
          body: new URLSearchParams({
            direccion,
            lat: lat?.toString() || '',
            lng: lng?.toString() || '',
            colaboradorUUID,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Heladera Registrada con éxito',
          description: 'Tu heladera fue procesada exitosamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setDireccion(''); // Limpia el formulario
        setLat(null); // Limpia la latitud
        setLng(null); // Limpia la longitud
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: 'Ocurrió un error al procesar la solicitud.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const selectedLat = place.geometry.location.lat();
        const selectedLng = place.geometry.location.lng();
        setLat(selectedLat); // Guarda la latitud en el estado
        setLng(selectedLng); // Guarda la longitud en el estado
        setDireccion(place.formatted_address || '');

        console.log('Latitud:', selectedLat);
        console.log('Longitud:', selectedLng);
      } else {
        console.error('No se encontraron coordenadas para esta dirección');
      }
    } else {
      console.error('Autocomplete no está listo aún.');
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        maxWidth="400px"
        width="100%"
        margin="0 auto"
        padding={6}
        borderRadius="lg"
        boxShadow="lg"
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
      >
        <Heading as="h2" size="lg" textAlign="center" mb={4}>
          Registrar Dirección de Heladera
        </Heading>

        <FormControl mb={4}>
          <FormLabel>Dirección:</FormLabel>
          <Autocomplete
            onLoad={(autocompleteInstance) => setAutocomplete(autocompleteInstance)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ingrese la dirección"
              required
              style={{
                width: '100%',
                height: '40px',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </Autocomplete>
        </FormControl>

        <Button type="submit" colorScheme="green" width="full" mb={4}>
          Enviar
        </Button>

        <Text textAlign="center" fontSize="sm">
          ¿No contas con el espacio físico?{' '}
          <Link href="/recomendar-puntos" color="teal.500" fontWeight="bold">
            Recomendar un punto
          </Link>
        </Text>
      </Box>
    </LoadScript>
  );
};

export default CargarHeladeraForm;
