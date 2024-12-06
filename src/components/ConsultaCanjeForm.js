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
    Select,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

function ConsultaCanjeForm() {
    const [productos, setProductos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRubro, setSelectedRubro] = useState(''); // Estado para el filtro de rubro
    const [loadingCanje, setLoadingCanje] = useState(null);
    const [loadingProductos, setLoadingProductos] = useState(true);
    const [loadingPuntos, setLoadingPuntos] = useState(true);
    const [error, setError] = useState(null);
    const [puntosActuales, setPuntosActuales] = useState(0);
    const { accessToken } = useAuth();
    const colaboradorUUID = localStorage.getItem('sub');
    const toast = useToast();

    // Fetch de productos disponibles
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoadingProductos(true);
                const response = await fetch('https://heladeras-dds-back.onrender.com/canjes/ofertasDisponibles', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) throw new Error('Error al obtener las ofertas.');

                const data = await response.json();
                setProductos(
                    data.map((oferta, index) => ({
                        id: index,
                        ofertaID: oferta.id,
                        nombre: oferta.nombre,
                        puntos: oferta.cantidadPuntosNecesarios,
                        imagen: oferta.imagen || 'https://via.placeholder.com/150',
                        rubro: oferta.rubro,
                    }))
                );
            } catch (err) {
                setError('Error al cargar las ofertas.');
            } finally {
                setLoadingProductos(false);
            }
        };

        fetchProductos();
    }, [accessToken]);

    // Fetch de puntos del colaborador
    useEffect(() => {
        const fetchPuntos = async () => {
            try {
                setLoadingPuntos(true);
                const response = await fetch(
                    `https://heladeras-dds-back.onrender.com/canjes/calcularPuntos?colaboradorUUID=${colaboradorUUID}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                if (!response.ok) throw new Error('Error al obtener los puntos del colaborador.');

                const puntos = await response.json();
                setPuntosActuales(puntos);
            } catch (err) {
                setError('Error al cargar los puntos.');
            } finally {
                setLoadingPuntos(false);
            }
        };

        fetchPuntos();
    }, [accessToken, colaboradorUUID]);

    // Canje de un producto
    const handleCanjear = async (productoId) => {
        const producto = productos.find((p) => p.id === productoId);

        if (!producto) {
            toast({
                title: 'Producto no encontrado',
                description: 'El producto seleccionado no está disponible.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (puntosActuales < producto.puntos) {
            toast({
                title: 'Puntos insuficientes',
                description: 'No tienes suficientes puntos para canjear esta oferta.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            setLoadingCanje(productoId);
            const response = await fetch(
                `https://heladeras-dds-back.onrender.com/canjes/canjear?colaboradorUUID=${colaboradorUUID}&ofertaId=${producto.ofertaID}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Error al canjear la oferta.');

            toast({
                title: 'Oferta canjeada',
                description: 'Tu canje fue procesado exitosamente.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            setPuntosActuales((prev) => prev - producto.puntos);
        } catch (err) {
            toast({
                title: 'Error al canjear',
                description: 'Ocurrió un problema, inténtalo más tarde.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingCanje(null);
        }
    };

    // Filtrado de productos
    const filteredProducts = productos.filter((producto) => {
        const matchesName = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRubro = selectedRubro === '' || producto.rubro === selectedRubro;
        return matchesName && matchesRubro;
    });

    const rubrosDisponibles = [...new Set(productos.map((producto) => producto.rubro))];

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
                <Heading size="md" mb={1}>Puntos actuales:</Heading>
                {loadingPuntos ? (
                    <Text>Cargando...</Text>
                ) : (
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {puntosActuales}
                    </Text>
                )}
            </Box>

            <Flex justifyContent="center" gap={4} mb={6} flexWrap="wrap">
                <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    width="250px"
                />
                <Select
                    placeholder="Filtrar por rubro"
                    value={selectedRubro}
                    onChange={(e) => setSelectedRubro(e.target.value)}
                    width="200px"
                >
                    {rubrosDisponibles.map((rubro) => (
                        <option key={rubro} value={rubro}>
                            {rubro}
                        </option>
                    ))}
                </Select>
            </Flex>

            {loadingProductos && <Text textAlign="center">Cargando ofertas...</Text>}
            {error && <Text textAlign="center" color="red.500">{error}</Text>}

            {!loadingProductos && !error && (
                <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={4}>
                {filteredProducts.map((producto) => (
                  <Box
                    key={producto.id}
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                    boxShadow="md"
                    textAlign="center"
                    transition="transform 0.3s, box-shadow 0.3s"
                    _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    minH="320px" // Ajusta este valor según tus necesidades
                  >
                    <Box>
                      {/* Contenedor de Imagen */}
                      <Box display="flex" justifyContent="center" alignItems="center" minH="150px" mb={3}>
                        <Image 
                          src={producto.imagen} 
                          alt={producto.nombre} 
                          borderRadius="md" 
                          maxH="150px" 
                          objectFit="contain" 
                        />
                      </Box>
              
                      {/* Contenedor de texto */}
                      <Box>
                        <Heading size="sm" mb={2}>{producto.nombre}</Heading>
                        <Text fontSize="md" color="gray.600" mb={1}>Puntos: {producto.puntos}</Text>
                        <Text fontSize="sm" color="gray.500">{producto.rubro}</Text>
                      </Box>
                    </Box>
              
                    {/* Botón */}
                    <Button
                      mt={3}
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleCanjear(producto.id)}
                      disabled={loadingCanje === producto.id}
                    >
                      {loadingCanje === producto.id ? <Spinner size="sm" /> : 'Canjear'}
                    </Button>
                  </Box>
                ))}
              </Grid>    
            )}
        </Box>
    );
}

export default ConsultaCanjeForm;
