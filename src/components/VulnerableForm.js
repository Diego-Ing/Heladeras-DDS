import React, { useState } from 'react';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Checkbox,
    Stack,
    NumberInput,
    NumberInputField,
    Box,
    Heading,
    useToast,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

const VulnerableForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        birthDate: '',
        isHomeless: false,
        address: '',
        hasMinors: false,
        minorsCount: ''
    });

    const { accessToken } = useAuth();
    const toast = useToast();
    const colaboradorUUID = localStorage.getItem('sub');  // Obtener el UUID del colaborador desde el localStorage

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        // Validación de nombre y apellido: solo letras
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nameRegex.test(formData.name) || !nameRegex.test(formData.lastName)) {
            toast({
                title: "Error en los datos",
                description: "El nombre y apellido solo deben contener letras.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        // Validación de fecha de nacimiento
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        if (isNaN(birthDate) || birthDate > today) {
            toast({
                title: "Error en la fecha",
                description: "Por favor, ingresa una fecha de nacimiento válida y no en el futuro.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        // Transformar datos para enviar
        const dataToSubmit = {
            nombre: formData.name,
            apellido: formData.lastName,
            fechaNacimiento: formData.birthDate,
            situacionCalle: formData.isHomeless,
            direccion: formData.isHomeless ? '' : formData.address,
            cantMenoresAcargo: formData.hasMinors ? parseInt(formData.minorsCount) : 0,
        };
    
        try {
            const url = `https://heladeras-dds-back.onrender.com/colaboraciones/persona-vulnerable?colaboradorUUID=${colaboradorUUID}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(dataToSubmit),
            });
    
            if (response.ok) {
                const responseData = await response.text();
                toast({
                    title: "Registro exitoso",
                    description: responseData || "Los datos de la persona vulnerable se registraron correctamente.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const errorText = await response.text();
                toast({
                    title: "Error",
                    description: errorText || "Ocurrió un error al registrar los datos.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error al registrar los datos:", error);
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor para registrar los datos.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box backgroundColor="white" padding={6} borderRadius="md" boxShadow="lg" maxWidth="500px" width="100%">
            <Heading as="h2" size="lg" textAlign="center" mb={4}>
                Registro de Persona Vulnerable
            </Heading>

            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl id="name" isRequired>
                        <FormLabel>Nombre</FormLabel>
                        <Input
                            type="text"
                            placeholder="Ingrese su nombre"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl id="lastName" isRequired>
                        <FormLabel>Apellido</FormLabel>
                        <Input
                            type="text"
                            placeholder="Ingrese su Apellido"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl id="birthDate" isRequired>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl id="isHomeless">
                        <Checkbox
                            name="isHomeless"
                            isChecked={formData.isHomeless}
                            onChange={handleInputChange}
                        >
                            ¿En situación de calle?
                        </Checkbox>
                    </FormControl>

                    {!formData.isHomeless && (
                        <FormControl id="address">
                            <FormLabel>Domicilio</FormLabel>
                            <Input
                                type="text"
                                placeholder="Ingrese su domicilio"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                    )}

                    <FormControl id="hasMinors">
                        <Checkbox
                            name="hasMinors"
                            isChecked={formData.hasMinors}
                            onChange={handleInputChange}
                        >
                            ¿Posee menores a cargo?
                        </Checkbox>
                    </FormControl>

                    {formData.hasMinors && (
                        <FormControl id="minorsCount">
                            <FormLabel>Cantidad de menores a cargo</FormLabel>
                            <NumberInput
                                name="minorsCount"
                                value={formData.minorsCount}
                                onChange={(valueString) =>
                                    setFormData({ ...formData, minorsCount: valueString })
                                }
                            >
                                <NumberInputField placeholder="Ingrese la cantidad de menores" />
                            </NumberInput>
                        </FormControl>
                    )}

                    <Button colorScheme="green" width="full" type="submit">
                        Registrar
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};

export default VulnerableForm;
