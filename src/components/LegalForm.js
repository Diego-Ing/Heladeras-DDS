import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  Heading,
  useToast,
  CheckboxGroup,
  Checkbox,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "../config/authContext";
import { useNavigate } from "react-router-dom";

function LegalForm({ onBack }) {
  const { accessToken, userSub, logout } = useAuth();
  const navigate = useNavigate();
  const [id , setDd] = useState("");
  const colaboradorUUID = userSub;
  const [formData, setFormData] = useState({
    companyName: "",
    organizationType: "",
    category: "",
    contactMethods: [],
    email: "",
    whatsapp: "",
    telegram: "",
    contactInfo: "",
    address: "",
  });
  const dto = {
    razonSocial: formData.companyName,
    tipo: formData.organizationType,
    rubro: formData.category,
    email: formData.email,
    mediosContacto: formData.contactMethods,
    whatsapp: formData.whatsapp,
    telegram: formData.telegram,
    direccion: formData.address,
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [contactMethod, setContactMethod] = useState("");
  const toast = useToast();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleContactInfoChange = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      contactInfo: newData,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.companyName || !formData.organizationType) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (formData.contactMethods.length <= 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos un método de contacto.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Realizar la solicitud POST
      console.log("Enviando formulario:", dto);
      const response = await fetch("https://heladeras-dds-back.onrender.com/users/personaJuridica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dto),
      });
  
      // Manejar la respuesta
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
    const message = await response.text();
    const idMatch = message.match(/ID: (\d+)/);
    if (idMatch && idMatch[1]) {
    const id = idMatch[1]; // Aquí tienes el ID extraído
    console.log("ID de la persona Juridica creada:", id);
    setDd(id);
  } else {
    throw new Error("No se pudo extraer el ID de la respuesta.");
  }
      console.log("enviando crear colaborador con uuid ", colaboradorUUID);
      const rta = await fetch(`https://heladeras-dds-back.onrender.com/roles/crear-colaborador?colaboradorUUID=${colaboradorUUID}&id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!rta.ok) {
        throw new Error(`Error en la solicitud: ${rta.statusText}`);
      }
      toast({
        title: "Alta Exitosa",
        description: "Porfavor vuelve a iniciar sesión, no olvides verificar tu email",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error) {
      // Manejar errores
      console.error("Error al enviar el formulario:", error);
  
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={6} borderWidth={1} borderRadius="md" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading size="lg" textAlign="center" mb={4}>
          Registro Persona Jurídica
        </Heading>
        <FormControl isRequired>
          <FormLabel>Razón Social</FormLabel>
          <Input
            type="text"
            placeholder="Razón Social"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Tipo</FormLabel>
          <Select
            placeholder="Seleccione el tipo de organización"
            name="organizationType"
            value={formData.organizationType}
            onChange={handleInputChange}
          >
            <option value="Gubernamental">Gubernamental</option>
            <option value="ONG">ONG</option>
            <option value="Empresa">Empresa</option>
            <option value="Institución">Institución</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Rubro</FormLabel>
          <Input
            type="text"
            placeholder="Rubro"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          />
        </FormControl>

        
        <FormLabel>Métodos de Contacto</FormLabel>
          <CheckboxGroup
            value={formData.contactMethods}
            onChange={(values) => setFormData({ ...formData, contactMethods: values })}
          >
            <HStack align="start">
              
              <Checkbox value="EMAIL">Email</Checkbox>
              <Checkbox value="WHATSAPP">WhatsApp</Checkbox>
              <Checkbox value="TELEGRAM">Telegram</Checkbox>
            </HStack>
          </CheckboxGroup>
      

        {formData.contactMethods.includes("EMAIL") && (
          <FormControl isRequired>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              placeholder="Ingrese su correo electrónico"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
        )}

        {formData.contactMethods.includes("TELEGRAM") && (
          <FormControl isRequired>
            <FormLabel>Telegram</FormLabel>
            <Input
              type="text"
              placeholder="Ingrese su chat ID de Telegram"
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
            />
          </FormControl>
        )}

        {formData.contactMethods.includes("WHATSAPP") && (
          <FormControl isRequired>
            <FormLabel>WhatsApp</FormLabel>
            <Input
              type="tel"
              placeholder="Ingrese su número de WhatsApp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Dirección (opcional)</FormLabel>
          <Textarea
            placeholder="Ingrese su dirección"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </FormControl>

        <Button type="submit" colorScheme="green" size="lg" width="full">
          Registrar
        </Button>
        <Button
            type="button"
            colorScheme="blue"
            onClick={onBack} // Redirigir a la página de selección
          >
            Volver atrás
          </Button>
      </VStack>
    </Box>
  );
}

export default LegalForm;
