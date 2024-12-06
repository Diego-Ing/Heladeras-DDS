import React, { useState } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    Textarea,
    useToast,
    Select
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

const VisitaTecnicoForm = () => {
    const [estadoHeladera, setEstadoHeladera] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [photo, setPhoto] = useState(null); // State to hold the photo file
    const [incidenteId, setIncidenteId] = useState(''); // New state for incidenteId
    const toast = useToast();
    const { accessToken } = useAuth();
    const tecnicoUUID = localStorage.getItem('sub');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Crear el objeto con los datos que se enviarán
        const data = {
            incidenteId: parseInt(incidenteId), // Asegúrate de que incidenteId sea un número
            comentario: comentarios,
            solucionado: estadoHeladera === 'Arreglada', // Enviar como booleano
        };

        // Si se seleccionó una foto, conviértela a base64
        if (photo) {
            const reader = new FileReader();
            reader.readAsDataURL(photo); // Convierte la foto a base64
            reader.onloadend = async () => {
                data.foto = reader.result; // Asigna el base64 de la foto al objeto
                await sendData(tecnicoUUID, data); // Llama a la función para enviar los datos
            };
        } else {
            await sendData(tecnicoUUID, data); // Si no hay foto, simplemente envía los datos
        }
    };

    const sendData = async (tecnicoUUID, data) => {
        const url = `https://heladeras-dds-back.onrender.com/incidentes/registrarVisita?tecnicoUUID=${tecnicoUUID}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json', // Enviar como JSON
                },
                body: JSON.stringify(data), // Convertir el objeto a JSON
            });

            if (response.ok) {
                const responseData = await response.text();
                toast({
                    title: 'Visita Técnica registrada',
                    description: responseData || 'La visita técnica fue procesada exitosamente.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const errorText = await response.text();
                toast({
                    title: 'Error',
                    description: errorText || 'Ocurrió un error al procesar la visita técnica.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error de conexión',
                description: 'No se pudo conectar con el servidor para procesar la visita técnica.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }

        // Limpiar los campos después de enviar
        setEstadoHeladera('');
        setComentarios('');
        setPhoto(null);
        setIncidenteId('');
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
                <FormControl id="incidenteId" isRequired>
                    <FormLabel>ID del Incidente</FormLabel>
                    <Input
                        type="text"
                        value={incidenteId}
                        onChange={(e) => setIncidenteId(e.target.value)}
                        placeholder="Ingrese el ID del incidente"
                    />
                </FormControl>

                <FormControl id="estadoHeladera" isRequired>
                    <FormLabel>Estado de la Heladera</FormLabel>
                    <Select
                        value={estadoHeladera}
                        onChange={(e) => setEstadoHeladera(e.target.value)}
                    >
                        <option value="Arreglada">Arreglada</option>
                        <option value="No arreglada">No arreglada</option>
                    </Select>
                </FormControl>

                <FormControl id="comentarios" isRequired>
                    <FormLabel>Comentarios Adicionales</FormLabel>
                    <Textarea
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        placeholder="Detalles adicionales sobre la visita"
                    />
                </FormControl>

                {/* Photo Upload Input */}
                <FormControl id="photo">
                    <FormLabel>Agregar Foto</FormLabel>
                    <Input
                        type="file"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        accept="image/*"
                    />
                </FormControl>

                <Button type="submit" colorScheme="green" width="100%">
                    Registrar Visita
                </Button>
            </VStack>
        </Box>
    );
};

export default VisitaTecnicoForm;
