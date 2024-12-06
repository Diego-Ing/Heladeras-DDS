import React, { useState } from "react";
import RecomendarPuntosApp from "../components/RecomendarPuntosApp";
import {
  Box,
  Input,
  Button,
  Flex,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

function RecomendarPuntosPage() {
  const [puntos, setPuntos] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radius, setRadius] = useState(0);
  const [direccion, setDireccion] = useState("");
  const { accessToken } = useAuth();
  const toast = useToast();
  const colaboradorUUID = localStorage.getItem('sub');

  const handleDireccionChange = (e) => {
    setDireccion(e.target.value);
  };

  const handleBuscarDireccion = () => {
    console.log("Buscar dirección:", direccion);
    // Lógica de búsqueda de dirección (a implementar si es necesario).
  };

  const handleAceptar = async () => {
    // Validación solo para el botón Aceptar.
    if (!selectedLocation || !direccion) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una ubicación en el mapa y completa la dirección.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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
            lat: selectedLocation.lat?.toString() || '',
            lng: selectedLocation.lng?.toString() || '',
            colaboradorUUID,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Heladera registrada correctamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setDireccion('');
        setSelectedLocation(null);
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo registrar la heladera: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    // Método original para "Obtener recomendación".
    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una ubicación en el mapa.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('https://heladeras-dds-back.onrender.com/heladeras/recomendarPuntos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
      toast({
        title: 'Error',
        description: 'No se pudieron obtener las recomendaciones. Inténtalo nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      direction="column"
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
    >
      <Box
        width="80vw"
        mt={12}
        mb={4}
        px={[2, 4, 16]}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Input
          flex={5}
          placeholder="Ingrese una dirección"
          value={direccion}
          onChange={handleDireccionChange}
          mr={2}
          borderColor="gray.300"
          bg={"white"}
        />
        <Button flex={1} onClick={handleAceptar} colorScheme="green">
          Aceptar
        </Button>
      </Box>

      <Flex
        width="80vw"
        height="80vh"
        bg="white"
        boxShadow="lg"
        borderRadius="lg"
        p={4}
        overflow="hidden"
      >
        <Box flex={1} bg="white" p={4}>
          <Text fontSize="lg" mb={4}>
            Seleccione un área en el mapa y presione <b>Obtener recomendación</b>
          </Text>

          <Box overflowY="auto" maxHeight="60vh">
            {puntos.map((punto) => (
              <Box
                key={punto.nombre}
                bg="teal.50"
                p={4}
                borderRadius="md"
                mb={2}
              >
                <Text>{punto.nombre}</Text>
                <Text>Lat: {punto.latitud}</Text>
                <Text>Long: {punto.longitud}</Text>
              </Box>
            ))}
          </Box>

          <Button mt={4} colorScheme="green" onClick={handleSubmit}>
            Obtener recomendación
          </Button>
        </Box>

        <Box flex={5} ml={4} borderRadius="md" overflow="hidden">
          <RecomendarPuntosApp
            radius={radius}
            selectedLocation={selectedLocation}
            setRadius={setRadius}
            setSelectedLocation={setSelectedLocation}
            puntos={puntos}
            setPuntos={setPuntos}
            setDireccion={setDireccion}
          />
        </Box>
      </Flex>
    </Flex>
  );
}

export default RecomendarPuntosPage;
