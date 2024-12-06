import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Textarea, Select, useToast } from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

function DistribucionViandasForm() {
    const [distribucion, setDistribucion] = useState({
        heladeraOrigenId: '',
        heladeraDestinoId: '',
        cantidadViandasAMover: '',
        motivo: '',
    });

    const [heladeras, setHeladeras] = useState([]); // Estado para almacenar las heladeras
    const { accessToken } = useAuth();
    const toast = useToast();
    const colaboradorUUID = localStorage.getItem('sub');

    // Cargar las heladeras desde el backend
    useEffect(() => {
        const fetchHeladeras = async () => {
            try {
                const response = await fetch('https://heladeras-dds-back.onrender.com/heladeras/listaHeladeras', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setHeladeras(data); // Guardamos las heladeras en el estado
                } else {
                    console.error('Error al obtener las heladeras');
                }
            } catch (error) {
                console.error('Error al obtener las heladeras:', error);
            }
        };

        fetchHeladeras();
    }, [accessToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDistribucion({
            ...distribucion,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validación: heladera origen y destino no pueden ser la misma
        if (distribucion.heladeraOrigenId === distribucion.heladeraDestinoId) {
            toast({
                title: 'Error',
                description: 'La heladera de origen y destino no pueden ser la misma.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return; // Evitamos enviar el formulario
        }

        const formData = {
            ...distribucion,
            heladeraOrigenId: parseInt(distribucion.heladeraOrigenId, 10),
            heladeraDestinoId: parseInt(distribucion.heladeraDestinoId, 10),
            cantidadViandasAMover: parseInt(distribucion.cantidadViandasAMover, 10),
        };

        fetch(`https://heladeras-dds-back.onrender.com/colaboraciones/distribucion-viandas?colaboradorUUID=${colaboradorUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                if (response.ok) {
                    toast({
                        title: 'Éxito',
                        description: 'Distribución de viandas guardada con éxito.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    setDistribucion({
                        heladeraOrigenId: '',
                        heladeraDestinoId: '',
                        cantidadViandasAMover: '',
                        motivo: '',
                    });
                } else {
                    const errorMessage = await response.text();
                    toast({
                        title: 'Error',
                        description: errorMessage || 'Ocurrió un error desconocido.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description: `Error de red: ${error.message}`,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    return (
        <Box as="form" onSubmit={handleSubmit} width="100%">
            <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                    <FormLabel htmlFor="heladeraOrigenId">Heladera Origen:</FormLabel>
                    <Select
                        id="heladeraOrigenId"
                        name="heladeraOrigenId"
                        value={distribucion.heladeraOrigenId}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione una heladera de origen</option>
                        {heladeras.map((heladera) => (
                            <option key={heladera.id} value={heladera.id}>
                                {heladera.nombrePunto}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel htmlFor="heladeraDestinoId">Heladera Destino:</FormLabel>
                    <Select
                        id="heladeraDestinoId"
                        name="heladeraDestinoId"
                        value={distribucion.heladeraDestinoId}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione una heladera de destino</option>
                        {heladeras.map((heladera) => (
                            <option key={heladera.id} value={heladera.id}>
                                {heladera.nombrePunto}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel htmlFor="cantidadViandasAMover">Cantidad de Viandas a Mover:</FormLabel>
                    <Input
                        type="number"
                        id="cantidadViandasAMover"
                        name="cantidadViandasAMover"
                        value={distribucion.cantidadViandasAMover}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel htmlFor="motivo">Motivo:</FormLabel>
                    <Textarea
                        id="motivo"
                        name="motivo"
                        value={distribucion.motivo}
                        onChange={handleChange}
                    />
                </FormControl>

                <Button colorScheme="green" type="submit">
                    Registrar Distribución
                </Button>
            </VStack>
        </Box>
    );
}

export default DistribucionViandasForm;
