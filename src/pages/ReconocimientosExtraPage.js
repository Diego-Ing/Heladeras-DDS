import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useAuth } from '../config/authContext';

const RecomendarPersonasPage = () => {
    const { accessToken } = useAuth(); // Obtén el token de acceso desde Auth0
    const [puntosReq, setPuntosReq] = useState("");
    const [viandasDonadasReq, setViandasDonadasReq] = useState("");
    const [cantMaxColabs, setCantMaxColabs] = useState("");
    const [personas, setPersonas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSearch = async () => {
        if (!puntosReq || !viandasDonadasReq || !cantMaxColabs) {
            toast({
                title: "Campos incompletos",
                description: "Por favor, completa todos los campos.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://heladeras-dds-recomendador.onrender.com/service-2/recomendaciones-colaboradores?puntosReq=${puntosReq}&viandasDonadasReq=${viandasDonadasReq}&cantMaxColabs=${cantMaxColabs}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`, // Agrega el token Bearer aquí
                    },
                }
            );

            if (!response.ok) throw new Error("Error al obtener las recomendaciones");

            const data = await response.json();
            setPersonas(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container 
            maxW="container.lg" 
            mb={10} 
            mx="auto"
            bg="transparent"
            pt="80px"  // Ajuste del padding-top para evitar que el navbar tape el contenido
            minH="100vh"  // Aseguramos que el contenedor tenga al menos la altura de la pantalla
        >
            <Heading mb={6} textAlign="center" color="black">
                Recomendación de Personas
            </Heading>

            <Box
                p={6}
                bg="gray.50"
                borderRadius="lg"
                boxShadow="md"
                mb={10}
            >
                <FormControl mb={4}>
                    <FormLabel fontWeight={'bold'}>Puntos Requeridos</FormLabel>
                    <Input
                        type="number"
                        placeholder="Ingresa los puntos requeridos"
                        value={puntosReq}
                        onChange={(e) => setPuntosReq(e.target.value)}
                    />
                </FormControl>

                <FormControl mb={4}>
                    <FormLabel fontWeight={'bold'}>Viandas Donadas Requeridas</FormLabel>
                    <Input
                        type="number"
                        placeholder="Ingresa las viandas donadas requeridas"
                        value={viandasDonadasReq}
                        onChange={(e) => setViandasDonadasReq(e.target.value)}
                    />
                </FormControl>

                <FormControl mb={4}>
                    <FormLabel fontWeight={'bold'}>Cantidad Máxima de Colaboradores</FormLabel>
                    <Input
                        type="number"
                        placeholder="Ingresa la cantidad máxima de colaboradores"
                        value={cantMaxColabs}
                        onChange={(e) => setCantMaxColabs(e.target.value)}
                    />
                </FormControl>

                <Button
                    colorScheme="green"
                    onClick={handleSearch}
                    isLoading={isLoading}
                >
                    Buscar
                </Button>
            </Box>

            {isLoading ? (
                <Spinner size="xl" color="green.500" />
            ) : personas.length > 0 ? (
                <Table variant="simple" size="lg">
                    <Thead>
                        <Tr>
                            <Th>Nombre</Th>
                            <Th>Apellido</Th> {/* Agregado Apellido */}
                            <Th>Dirección</Th>
                            <Th>Medios de Contacto</Th> {/* Agregado Medios de Contacto */}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {personas.map((persona) => (
                            <Tr key={persona.id}>
                                <Td>{persona.nombre}</Td>
                                <Td>{persona.apellido}</Td> {/* Mostrar Apellido */}
                                <Td>{persona.direccion}</Td>
                                <Td>
                                    {persona.mediosContacto.map((contacto, index) => (
                                        <Text key={index}>{contacto.valor}</Text>
                                    ))}
                                </Td> {/* Mostrar Medios de Contacto */}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            ) : (
                <Text textAlign="center" mt={4} color="gray.500">
                    No se encontraron resultados.
                </Text>
            )}
        </Container>
    );
};

export default RecomendarPersonasPage;
