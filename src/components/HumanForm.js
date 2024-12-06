import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, Heading, Select, FormControl, FormLabel, Input, CheckboxGroup, Checkbox, HStack, Button, ButtonGroup, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../config/authContext';
function HumanForm({ onBack }) {
  const { accessToken, userSub, logout }= useAuth();
  const [id , setId] = useState("");
  const colaboradorUUID = userSub;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    contactMethods: [],
    email: "",
    whatsapp: "",
    telegram: "",
    birthdate: "",
    address: "",
    tipoDocumento:"",
    formasContribucion: [],
    dineroChecked: false,
    viandaChecked: false,
    distribucionChecked: false,
    numeroDocumento: "",
  });

  const toast = useToast();
  const navigate = useNavigate(); 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validación de campos
    if (!formData.name || !formData.lastName) {
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
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  if (formData.birthdate) {
    const birthdate = new Date(formData.birthdate);
    if (birthdate >= today) {
      toast({
        title: "Error",
        description: "La fecha de nacimiento no puede ser hoy ni una fecha futura.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  }
  
    // Crear el DTO
    const dto = {
      nombre: formData.name,
      apellido: formData.lastName,
      mediosContacto: formData.contactMethods,
      email: formData.email,
      whatsapp: formData.whatsapp,
      telegram: formData.telegram,
      fechaNacimiento: formData.birthdate,
      direccion: formData.address,
      donacionDinero: formData.dineroChecked,
      donacionVianda: formData.viandaChecked,
      distribucionViandas: formData.distribucionChecked,
      tipo: formData.tipoDocumento,
      documento: formData.numeroDocumento,
    };
    setIsSubmitting(true);
    try {
      // Realizar la solicitud POST
      console.log("Enviando formulario:", dto);
      const response = await fetch("https://heladeras-dds-back.onrender.com/users/personaHumana", {
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
      
      if (!idMatch || !idMatch[1]) {
        throw new Error("No se pudo extraer el ID de la respuesta.");
      }
    
      const id = idMatch[1]; // ID extraído
      console.log("ID de la persona humana creada:", id);
    
      // Crear el colaborador
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
    }finally
    {
      setIsSubmitting(false);
    }
    
  };
  

  return (
    <Box as="form" onSubmit={handleSubmit} p={6} borderWidth={1} borderRadius="md" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading size="lg" textAlign="center" mb={4}>
          Registrar Persona Humana
        </Heading>

        <FormControl isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input
            type="text"
            placeholder="Ingrese su nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Apellido</FormLabel>
          <Input
            type="text"
            placeholder="Ingrese su apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
  <FormLabel>Tipo de Documento (opcional)</FormLabel>
  <Select
    placeholder="Seleccione el tipo de documento"
    value={formData.tipoDocumento}
    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
  >
    <option value="DNI">DNI</option>
    <option value="Pasaporte">Pasaporte</option>
    <option value="Cédula">Cédula</option>
  </Select>
</FormControl>

<FormControl >
  <FormLabel>Número de Documento (opcional)</FormLabel>
  <Input
    type="text"
    placeholder="Ingrese su número de documento"
    value={formData.numeroDocumento}
    onChange={(e) => {
      const value = e.target.value;
      // Permitir solo valores numéricos con un máximo de 10 dígitos
      if (/^\d{0,10}$/.test(value)) {
        setFormData({ ...formData, numeroDocumento: value });
      }
    }}
  />
  {formData.numeroDocumento.length > 10 && (
    <Text color="red.500" fontSize="sm">
      El número de documento no puede exceder los 10 dígitos.
    </Text>
  )}
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

          <FormLabel>Formas de Contribuir</FormLabel>
          <CheckboxGroup
            value={formData.formasContribucion}
            onChange={(values) => setFormData({ ...formData, formasContribucion: values })}
          >
            <HStack spacing={4}>
              <Checkbox
                name="dineroChecked"
                isChecked={formData.dineroChecked}
                onChange={handleChange}
              >
                Donación de dinero
              </Checkbox>
              <Checkbox
                name="viandaChecked"
                isChecked={formData.viandaChecked}
                onChange={handleChange}
              >
                Donación de vianda
              </Checkbox>
              <Checkbox
                name="distribucionChecked"
                isChecked={formData.distribucionChecked}
                onChange={handleChange}
              >
                Distribución de "viandas"
              </Checkbox>
            </HStack>
          </CheckboxGroup>

        <FormControl>
        <FormLabel>Fecha de Nacimiento (opcional)</FormLabel>
  <Input
    type="date"
    name="birthdate"
    value={formData.birthdate}
    onChange={handleChange}
  />
        </FormControl>

        <FormControl>
          <FormLabel>Dirección (opcional)</FormLabel>
          <Input
            type="text"
            placeholder="Ingrese su dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </FormControl>

        <ButtonGroup justifyContent="center" mt={4}>
        <Button type="button" colorScheme="blue" onClick={onBack}>Volver atrás</Button>
        <Button
        type="submit"
        colorScheme="blue"
        isLoading={isSubmitting} // Mostrar spinner mientras se envía
        disabled={isSubmitting} // Desactivar botón mientras se envía
      >
        Enviar
      </Button>
          
        </ButtonGroup>
      </VStack>
    </Box>
  );
}

export default HumanForm;
