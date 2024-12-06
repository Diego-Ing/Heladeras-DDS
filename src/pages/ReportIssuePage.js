import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Container,
  Spinner,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import ReportIssueForm from "../components/ReportIssueForm";
import { useAuth } from "../config/authContext";

const ReportIssuePage = () => {
  const [heladeras, setHeladeras] = useState([]); // Estado para las heladeras
  const [isLoading, setLoading] = useState(false); // Estado para manejar la carga
  const { accessToken } = useAuth(); // Acceso al token de autenticación
  const toast = useToast(); // Toast para mostrar notificaciones
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const abortController = new AbortController();
    const fetchHeladeras = async () => {
      setLoading(true); // Inicia el estado de carga
      try {
        const response = await fetch(
          "https://heladeras-dds-back.onrender.com/heladeras/listaHeladeras",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: abortController.signal, // Permite abortar la solicitud si el componente se desmonta
          }
        );

        if (!response.ok) throw new Error("Error al cargar las heladeras.");

        const data = await response.json();
        setHeladeras(data); // Actualiza el estado con los datos de las heladeras
      } catch (error) {
        if (error.name !== "AbortError") {
          toast({
            title: "Error",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchHeladeras();
    return () => abortController.abort(); // Limpia la solicitud si el componente se desmonta
  }, [accessToken, toast]);

  return (
    <Container
      maxW="container.lg"
      mb={10}
      mx="auto"
      pt="80px" // Evita que el navbar tape el contenido
      minH="100vh" // Contenedor con altura mínima de pantalla
    >
      <Flex
        direction={isMobile ? "column" : "row"}
        align="center"
        justify="center"
        minH={isMobile ? "auto" : "80vh"} // Altura ajustada para pantallas pequeñas
        bg="gray.100"
        borderRadius="lg"
        boxShadow="md"
        p={8}
        overflow="hidden" // Evita que el contenido se desborde
      >
        <Box flex="1" p={6} textAlign="center" pr={isMobile ? 0 : 10}>
          <Heading size="xl" mb={4} color="#8DC77E">
            Reportar Falla Técnica
          </Heading>
          <Text fontSize="lg" color="#8DC77E" mb={6}>
            Con tu ayuda, podemos mantener nuestras heladeras en óptimas
            condiciones. Reporta cualquier problema técnico para que podamos
            solucionarlo rápidamente.
          </Text>
        </Box>
        <Box
          flex="1"
          p={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          id="report-issue-form"
          maxW={isMobile ? "100%" : "50%"} // Ajuste para móviles
        >
          {isLoading ? (
            // Mostrar un spinner mientras se cargan los datos
            <Spinner size="xl" color="#8DC77E" />
          ) : heladeras.length > 0 ? (
            // Renderizar el formulario solo si las heladeras están disponibles
            
            <ReportIssueForm fridges={heladeras} />
          ) : (
            // Mensaje si no hay datos disponibles
            <Text color="gray.500" textAlign="center">
              No se encontraron heladeras. Por favor, intenta más tarde.
            </Text>
          )}
        
        </Box>
      </Flex>
    </Container>
  );
};

export default ReportIssuePage;
