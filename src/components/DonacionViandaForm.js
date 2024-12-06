import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    NumberInput,
    NumberInputField,
    useToast,
    Select,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

const DonacionViandaForm = () => {
    const [comida, setComida] = useState('');
    const [fechaDeCaducidad, setFechaDeCaducidad] = useState('');
    const [calorias, setCalorias] = useState('');
    const [peso, setPeso] = useState('');
    const [heladeraId, setHeladeraId] = useState(null); // Cambiado a null inicialmente
    const [heladeras, setHeladeras] = useState([]); // Estado para almacenar la lista de heladeras
    const toast = useToast();
    const { accessToken } = useAuth();

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
                    setHeladeras(data); // Guardar la lista de heladeras en el estado
                } else {
                    console.error('Error al obtener las heladeras');
                }
            } catch (error) {
                console.error('Error al obtener las heladeras:', error);
            }
        };

        fetchHeladeras();
    }, [accessToken]); // Ejecutar el efecto al montar el componente

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fechaFormateada = new Date(fechaDeCaducidad).toISOString().split('T')[0];

        const formData = {
            comida,
            fechaCaducidad: fechaFormateada,
            calorias: parseFloat(calorias),
            peso: parseFloat(peso),
            heladeraId: heladeraId,
        };

        const colaboradorUUID = localStorage.getItem('sub');
        const url = `https://heladeras-dds-back.onrender.com/colaboraciones/donacion-vianda?colaboradorUUID=${colaboradorUUID}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.text();
                toast({
                    title: 'Donación de Vianda realizada',
                    description: data || 'Tu donación de vianda fue procesada exitosamente.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const errorText = await response.text();
                toast({
                    title: 'Error',
                    description: errorText || 'Ocurrió un error al procesar la donación.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error de conexión',
                description: 'No se pudo conectar con el servidor para procesar la donación.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }

        setComida('');
        setFechaDeCaducidad('');
        setCalorias('');
        setPeso('');
        setHeladeraId(null);
    };

    return (
        <Box
            bg="white"
            p={8}
            borderRadius="lg"
            boxShadow="xl"
            width="100%"
            maxW="400px"
        >
            <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                <FormControl id="comida" isRequired>
                    <FormLabel>Comida</FormLabel>
                    <Input
                        type="text"
                        value={comida}
                        onChange={(e) => setComida(e.target.value)}
                    />
                </FormControl>

                <FormControl id="fechaDeCaducidad" isRequired>
                    <FormLabel>Fecha de Caducidad</FormLabel>
                    <Input
                        type="date"
                        value={fechaDeCaducidad}
                        onChange={(e) => setFechaDeCaducidad(e.target.value)}
                    />
                </FormControl>

                <FormControl id="calorias" isRequired>
                    <FormLabel>Calorías</FormLabel>
                    <NumberInput
                        value={calorias}
                        onChange={(value) => setCalorias(value)}
                        step={0.01}
                        min={0}
                    >
                        <NumberInputField />
                    </NumberInput>
                </FormControl>

                <FormControl id="peso" isRequired>
                    <FormLabel>Peso (en gramos)</FormLabel>
                    <NumberInput
                        value={peso}
                        onChange={(value) => setPeso(value)}
                        step={0.01}
                        min={0}
                    >
                        <NumberInputField />
                    </NumberInput>
                </FormControl>

                <FormControl id="heladeraId" isRequired>
                    <FormLabel>Seleccionar Heladera</FormLabel>
                    <Select
                        placeholder="Seleccione una heladera"
                        value={heladeraId || ''}
                        onChange={(e) => setHeladeraId(Number(e.target.value))}
                    >
                        {heladeras.map((heladera) => (
                            <option key={heladera.id} value={heladera.id}>
                                {heladera.nombrePunto}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" colorScheme="green" width="100%">
                    Enviar Donación
                </Button>
            </VStack>
        </Box>
    );
};

export default DonacionViandaForm;
