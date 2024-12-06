import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast } from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

function PublicarProductoForm() {
    const [product, setProduct] = useState({
        rubro: '', // Cambié 'name' por 'rubro' porque el backend lo espera
        nombre: '', // Cambié 'name' por 'nombre' porque el backend lo espera
        cantidadPuntosNec: 0, // Cambié 'points' por 'cantidadPuntosNec' porque el backend lo espera
        imagen: null // Cambié 'image' por 'imagen'
    });
    const toast = useToast(); // Hook de Chakra UI para mostrar mensajes
    const colaboradorUUID = localStorage.getItem('sub'); // Obtengo el UUID del colaborador del localStorage
    const { accessToken } = useAuth();
  

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduct({
                ...product,
                imagen: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        const toastId = toast({
            title: 'Procesando...',
            description: 'Estamos subiendo la imagen y creando la oferta.',
            status: 'info',
            duration: 5000,
            isClosable: true,
        });
    
        // URL del endpoint para subir la imagen
        const imageUploadUrl = 'https://heladeras-dds-back.onrender.com/api/storage/upload';
        let imageUrl = null; // Guardará la URL pública de la imagen
    
        // 1. Subir la imagen si se proporcionó una
        if (product.imagen) {
            const formData = new FormData();
            formData.append('file', product.imagen);
    
            try {
                const imageResponse = await fetch(imageUploadUrl, {
                    method: 'POST',
                    body: formData,
                });
    
                if (!imageResponse.ok) {
                    throw new Error('Error al subir la imagen');
                }
    
                // Obtener la URL pública de la imagen
                const responseText = await imageResponse.text(); // Suponiendo que el backend devuelve la URL como texto
                imageUrl = responseText;
    
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
    
        // 2. Crear la oferta con la imagen si fue subida correctamente
        const productData = {
            rubro: product.rubro,
            nombre: product.nombre,
            cantidadPuntosNec: product.cantidadPuntosNec,
            imagen: imageUrl, // Incluye la URL de la imagen en los datos
        };
        console.log('imagenUrl:', imageUrl);
        // URL del endpoint para crear la oferta
        const offerCreateUrl = `https://heladeras-dds-back.onrender.com/colaboraciones/oferta?colaboradorUUID=${colaboradorUUID}`;
    
        try {
            const offerResponse = await fetch(offerCreateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(productData),
            });
    
            if (!offerResponse.ok) {
                throw new Error('Error al crear la oferta');
            }
    
            const responseText = await offerResponse.text();
            const data = JSON.parse(responseText);
    
            toast.update(toastId, {
                title: 'Oferta creada con éxito',
                description: data.message || 'La oferta fue procesada exitosamente.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
    
        } catch (error) {
            console.error('Error al crear la oferta:', error);
            toast.update(toastId, {
                title: 'Error al crear la oferta',
                description: 'No se pudo procesar la oferta en el servidor.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };
    


    return (
        <Box as="form" onSubmit={handleSubmit} width="100%">
            <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                    <FormLabel htmlFor="rubro">Rubro:</FormLabel>
                    <Input
                        type="text"
                        id="rubro"
                        name="rubro"
                        value={product.rubro}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel htmlFor="nombre">Nombre del Producto:</FormLabel>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={product.nombre}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel htmlFor="cantidadPuntosNec">Puntos necesarios:</FormLabel>
                    <Input
                        type="number"
                        id="cantidadPuntosNec"
                        name="cantidadPuntosNec"
                        value={product.cantidadPuntosNec}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel htmlFor="imagen">Selecciona una imagen:</FormLabel>
                    <Input
                        type="file"
                        id="imagen"
                        name="imagen"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </FormControl>

                <Button colorScheme="green" type="submit">Publicar</Button>
            </VStack>
        </Box>
    );
}

export default PublicarProductoForm;
