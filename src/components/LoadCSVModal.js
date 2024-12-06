import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

function LoadCSVModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const toast = useToast();
  const { accessToken } = useAuth();
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo antes de cargarlo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://heladeras-dds-back.onrender.com/cargaCSV/cargarCSV', {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }

      const data = await response.text();
      toast({
        title: 'Éxito',
        description: data,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el archivo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cargar archivo CSV</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              variant="outline"
              size="md"
            />
            <Button onClick={handleSubmit} colorScheme="green" size="md">
              Cargar
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default LoadCSVModal;
