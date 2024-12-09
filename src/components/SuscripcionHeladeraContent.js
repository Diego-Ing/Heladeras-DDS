import React, { useState, useEffect } from 'react';
import {
    Box,
    Input,
    Button,
    Text,
    Grid,
    Image,
    Heading,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    FormControl,
    Checkbox,
    CheckboxGroup,
    HStack,
    useDisclosure,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';
import IcoHeladera from '../assets/iconos/Food.svg';

const HeladeraCard = ({ heladera, onSuscribirse }) => (
    <Box
        p={3}
        bg="gray.200"
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
        transition="transform 0.3s, box-shadow 0.3s"
        _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
        width="200px"
        height="280px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
    >
        <Flex justifyContent="center" alignItems="center" mb={3} height="100px">
            <Image
                src={IcoHeladera}
                alt={heladera.nombrePunto}
                borderRadius="md"
                maxHeight="80px"
                maxWidth="100%"
            />
        </Flex>
        <Heading size="sm" mb={2} fontSize="16px" textAlign="center" noOfLines={2}>
            {heladera.nombrePunto}
        </Heading>
        <Button
            mt={3}
            size="sm"
            colorScheme="green"
            onClick={() => onSuscribirse(heladera)}
            width="100%"
        >
            Suscribirse
        </Button>
    </Box>
);

function SuscripcionHeladeraContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [heladeras, setHeladeras] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedHeladera, setSelectedHeladera] = useState(null);
    const [tiposEventosSeleccionados, setTiposEventosSeleccionados] = useState([]);
    const [tiposContactosSeleccionados, setTiposContactosSeleccionados] = useState([]);
    const [viandasNumberMax, setViandasNumberMax] = useState('');
    const [viandasNumberMin, setViandasNumberMin] = useState('');
    const [contactos, setContactos] = useState([]);
    const { accessToken, userSub } = useAuth();
    const [loadingSuscripcion, setSuscripcion] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchContactos = async () => {
            try {
                const response = await fetch(`https://heladeras-dds-back.onrender.com/users/contactos?UUID=${userSub}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) throw new Error('Error al cargar los contactos.');
                const data = await response.json();
                // Mapear contactos recibidos
                setContactos(
                    data.map((contacto) => ({
                        tipo: contacto.tipo,
                        valor: contacto.valor,
                    }))
                );
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        fetchContactos();
    }, [accessToken, toast]);
    // Fetch de heladeras
    useEffect(() => {
        const abortController = new AbortController();

        const fetchHeladeras = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://heladeras-dds-back.onrender.com/heladeras/listaHeladeras', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    signal: abortController.signal,
                });

                if (!response.ok) throw new Error('Error al cargar las heladeras.');

                const data = await response.json();
                setHeladeras(data);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    toast({
                        title: 'Error',
                        description: error.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHeladeras();
        return () => abortController.abort();
    }, [accessToken, toast]);

    const handleSuscribirse = (heladera) => {
        setSelectedHeladera(heladera);
        onOpen();
    };
    const colaboradorUUID = localStorage.getItem('sub');
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const suscripcionDTO = {
            colaboradorUUID: colaboradorUUID,
            heladeraId: selectedHeladera?.id,
            tiposEventosSeleccionados,
            tiposContactosSeleccionados,
            cantidadViandasMax: parseInt(viandasNumberMax, 10) || 0,
            cantidadViandasMin: parseInt(viandasNumberMin, 10) || 0,
        };
    
        try {
            // Establecer el estado de carga
            setSuscripcion(selectedHeladera?.id);
            
            const response = await fetch('https://heladeras-dds-back.onrender.com/suscripciones/suscribir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(suscripcionDTO),
            });
    
            // Verifica el código de respuesta HTTP
            if (response.ok) {
                const result = await response.text();
                console.log('Resultado:', result);
                toast({
                    title: 'Éxito',
                    description: 'Colaborador suscrito exitosamente.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                onClose();
            } else if (response.status === 409) {
                // Si el código es 409, el colaborador ya está suscripto
                toast({
                    title: 'Advertencia',
                    description: 'Usted ya está suscripto a esta heladera.',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
                onClose();
            } else {
                // Si hay otro tipo de error, mostramos el mensaje de error
                const errorText = await response.text();
                throw new Error(errorText || 'Error al suscribir colaborador.');
            }
        } catch (error) {
            console.error('Error al enviar la suscripción:', error);
            toast({
                title: 'Warning',
                description: error.message || 'No se pudo completar la suscripción.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            // Desactivar el estado de carga
            setSuscripcion(null);
        }
    };
    

    const filteredHeladeras = heladeras.filter((h) =>
        h.nombrePunto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box
            width="100%"
            maxW="1300px"
            minW="400px"
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            overflowY="auto"
            maxHeight="80vh"
        >
            <Box textAlign="center" mb={6}>
                <Heading size="md" mb={1}>Suscripción a Heladeras</Heading>
            </Box>
            <Flex justifyContent="center" mb={6}>
                <Input
                    placeholder="Buscar heladera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    width="250px"
                    mr={2}
                />
            </Flex>
            {loading ? (
                <Text textAlign="center">Cargando heladeras...</Text>
            ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4} justifyItems="center">
                    {filteredHeladeras.map((heladera) => (
                        <HeladeraCard key={heladera.id} heladera={heladera} onSuscribirse={handleSuscribirse} />
                    ))}
                </Grid>
            )}

<Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
        <ModalHeader>Formulario de Suscripción para {selectedHeladera?.nombrePunto}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
            <form onSubmit={handleSubmit}>

            <VStack spacing={4}>
            <CheckboxGroup
                        value={tiposEventosSeleccionados}
                        onChange={(values) => setTiposEventosSeleccionados(values)}
                    >
                        <VStack align="start">
                            <Text fontWeight="bold">Tipos de Eventos:</Text>
                            <Checkbox value="POCAS_VIANDAS">Pocas Viandas</Checkbox>
                            <Checkbox value="MUCHAS_VIANDAS">Muchas Viandas</Checkbox>
                            <Checkbox value="FALLA_TECNICA">Falla Técnica</Checkbox>
                        </VStack>
                    </CheckboxGroup>
                    </VStack>
                    <br></br>
                <VStack spacing={4}>
                    {/* Mostrar contactos del usuario */}
                    <CheckboxGroup
                        value={tiposContactosSeleccionados}
                        onChange={setTiposContactosSeleccionados}
                    >
                        <VStack align="start">
                            <Text fontWeight="bold">Contactos Disponibles:</Text>
                            {contactos.length === 0 ? (
                                <Text>No tienes contactos disponibles.</Text>
                            ) : (
                                contactos.map((contacto, index) => (
                                    <Checkbox key={index} value={contacto.tipo.toUpperCase()}>
                                        {contacto.tipo}: {contacto.valor}
                                    </Checkbox>
                                ))
                            )}
                        </VStack>
                    </CheckboxGroup>

                    {/* Opciones de eventos */}
                    

                    {/* Inputs para viandas */}
                    <FormControl>
                        <Input
                            placeholder="Cantidad de viandas Mínima"
                            type="number"
                            value={viandasNumberMin}
                            onChange={(e) => setViandasNumberMin(e.target.value)}
                            isDisabled={!tiposEventosSeleccionados.includes('POCAS_VIANDAS')}
                        />
                    </FormControl>
                    <FormControl>
                        <Input
                            placeholder="Cantidad de viandas Máxima"
                            type="number"
                            value={viandasNumberMax}
                            onChange={(e) => setViandasNumberMax(e.target.value)}
                            isDisabled={!tiposEventosSeleccionados.includes('MUCHAS_VIANDAS')}
                        />
                    </FormControl>

                    {/* Botones */}
                    <HStack spacing={4}>
                    <Button type="submit" colorScheme="green">
                    {loadingSuscripcion === selectedHeladera?.id ? <Spinner size="sm" /> : 'Suscribirse'}
                        </Button>
                        <Button onClick={onClose} colorScheme="red">
                            Cancelar
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </ModalBody>
    </ModalContent>
</Modal>


        </Box>
    );
}

export default SuscripcionHeladeraContent;
