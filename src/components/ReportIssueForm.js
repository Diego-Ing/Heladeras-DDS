import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

const ReportIssueForm = ({ fridges }) => {
  const { accessToken } = useAuth();
  const toast = useToast();
  const colaboradorUUID = localStorage.getItem('sub');

  const [formData, setFormData] = useState({
    heladeraId: '',
    descripcion: '',
    email: '',
    foto: null, // Archivo opcional
  });

  const handleChange = ({ target: { id, value, files } }) => {
    setFormData((prev) => ({
      ...prev,
      [id]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    const toastId = toast({
      title: 'Procesando...',
      description: 'Estamos subiendo la imagen y enviando tu reporte.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });

    let imageUrl = null; // Guardará la URL de la imagen si es subida correctamente

    // Subir la imagen si se proporcionó una
    if (formData.file) {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', formData.file);

      try {
        const imageResponse = await fetch('https://heladeras-dds-back.onrender.com/api/storage/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (!imageResponse.ok) {
          throw new Error('Error al subir la imagen');
        }

        // Obtener la URL de la imagen subida
        const responseText = await imageResponse.text();
        imageUrl = responseText; // Suponemos que la URL es el cuerpo de la respuesta

      } catch (error) {
        console.error('Error al subir la imagen:', error);
        toast.update(toastId, {
          title: 'Error al subir la imagen',
          description: 'No se pudo subir la imagen al servidor.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return; // Salir del flujo si la subida de la imagen falla
      }
    }

    // Enviar los datos del reporte, incluyendo la URL de la imagen (si fue subida correctamente)
    const reportData = {
      heladeraId: formData.heladeraId,
      descripcion: formData.descripcion,
      fecha: today,
      email: formData.email,
      foto: imageUrl, // Incluir la URL de la imagen (si existe)
    };

    try {
      const response = await fetch(
        `https://heladeras-dds-back.onrender.com/incidentes/reportarFallaTecnica?colaboradorUUID=${colaboradorUUID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(reportData),
        }
      );

      const message = await response.text();
      toast.update(toastId, {
        title: response.ok ? 'Reporte Exitoso' : 'Error',
        description: message || (response.ok ? 'En breve se atenderá.' : 'Ocurrió un error.'),
        status: response.ok ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    } catch {
      toast.update(toastId, {
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" p={6} borderRadius="md" bg="gray.50" boxShadow="md" onSubmit={handleSubmit}>
      <Heading as="h2" fontSize="2xl" mb={4}>
        Reportar un problema
      </Heading>

      <FormControl mb={4}>
        <FormLabel htmlFor="heladeraId">Selecciona una heladera</FormLabel>
        <Select
          id="heladeraId"
          placeholder="Selecciona una heladera"
          bg="white"
          value={formData.heladeraId}
          onChange={handleChange}
        >
          {fridges.map(({ id, nombrePunto }) => (
            <option key={id} value={id}>
              {nombrePunto}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel htmlFor="descripcion">Descripción del problema</FormLabel>
        <Textarea
          id="descripcion"
          placeholder="Describe el problema..."
          bg="white"
          value={formData.descripcion}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel htmlFor="email">Correo electrónico</FormLabel>
        <Input
          id="email"
          type="email"
          placeholder="Tu correo electrónico"
          bg="white"
          value={formData.email}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel htmlFor="file">Subir una foto</FormLabel>
        <Input id="file" type="file" accept="image/*" onChange={handleChange} />
      </FormControl>

      <Button type="submit" colorScheme="green" width="100%">
        Enviar Reporte
      </Button>
    </Box>
  );
};

export default ReportIssueForm;

