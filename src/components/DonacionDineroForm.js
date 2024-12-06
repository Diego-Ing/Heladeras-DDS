import React, { useState } from "react";
import { FormControl, FormLabel, Input, Button, Heading, Box, Text, Flex, useToast } from "@chakra-ui/react";
import MercadoPago from "../assets/iconos/MercadoPago.svg";
import PayPal from "../assets/iconos/PayPal.svg";
import CreditCard from "../assets/iconos/CreditCard.svg";
import { useAuth } from "../config/authContext";

function DonacionDineroForm() {
  const [monto, setMonto] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el spinner
  const colaboradorUUID = localStorage.getItem("sub");
  const { accessToken } = useAuth();
  const toast = useToast();

  const handleDonation = async () => {
    setIsLoading(true); // Activar el spinner
    try {
      const response = await fetch("https://heladeras-dds-back.onrender.com/colaboraciones/donacion-dinero", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
        body: new URLSearchParams({
          monto,
          colaboradorUUID,
        }),
      });

      if (response.ok) {
        const data = await response.text();
        toast({
          title: "Donación realizada",
          description: data || "Tu donación de dinero fue procesada exitosamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorText = await response.text();
        toast({
          title: "Error",
          description: errorText || "Ocurrió un error al procesar la donación.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al realizar la donación:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor para procesar la donación.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  return (
    <Box backgroundColor="white" padding={6} borderRadius="md" boxShadow="lg" maxWidth="500px" width="100%">
      <Heading as="h2" size="lg" textAlign="center" mb={4}>
        Donación de dinero
      </Heading>

      <FormControl id="monto" mb={4}>
        <FormLabel>Monto:</FormLabel>
        <Input
          type="number"
          placeholder="Ingrese el monto a donar"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </FormControl>

      <Text fontSize="lg" mb={2}>
        Doná con los siguientes métodos de pago:
      </Text>
      <Flex justifyContent="space-around" mb={6}>
        <img src={MercadoPago} alt="Mercado Pago" width="50" />
        <img src={PayPal} alt="PayPal" width="50" />
        <img src={CreditCard} alt="Tarjeta de Crédito" width="50" />
      </Flex>

      <Button
        variant="solid"
        colorScheme="green"
        width="full"
        onClick={handleDonation}
        isLoading={isLoading} 
        loadingText="Procesando" 
      >
        Donar
      </Button>
    </Box>
  );
}

export default DonacionDineroForm;
