import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Heading, Text, Button, Image, useBreakpointValue } from '@chakra-ui/react';
import HeaderImage from '../assets/imgs/Header.png';
import { useAuth } from '../config/authContext';
function HeaderApp() {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    const checkRoles = async () => {
      // Retrasa ligeramente la ejecución para asegurar que `cached_roles` esté disponible
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      const dato = localStorage.getItem("cached_roles");

      if (!dato && isAuthenticated) {
        navigate("/persona-form");
      }
    };

    checkRoles();
  }, [isAuthenticated, navigate]);
  
  return (
    <Flex
      ref={headerRef}
      className="header-container"
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="center"
      minH="100vh"
      bg="transparent"
      p={8}
    >
      {/* Título y descripción */}
      <Box
        
        className="title-container"
        textAlign={{ base: 'center', md: 'left' }}
        mb={{ base: 6, md: 0 }}
      >
        <Heading as="h1" size="2xl" mb={4} color="gray.800">
          Heladeras <br /> Comunitarias
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="lg" mb={6}>
          Un espacio solidario para compartir alimentos con quienes más lo necesitan.
        </Text>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={3}
          width="100%"
          justify={{ base: 'center', md: 'start' }}
        >
          <Button
            as={RouterLink}
            to="/donacion-dinero"
            colorScheme="gray"
            bg="gray.800"
            size="lg"
            color="white"
            _hover={{ bg: 'gray.700' }}
            mb={{ base: 4, md: 0 }}
          >
            Doná
          </Button>
          <Button
            as={RouterLink}
            to="/distribucion-viandas"
            colorScheme="gray"
            bg="gray.800"
            size="lg"
            color="white"
            _hover={{ bg: 'gray.700' }}
          >
            Sé Voluntario
          </Button>
        </Flex>
      </Box>

      {/* Imagen */}
      {!isMobile && (
        <Box
          className="image-container"
          maxW="500px"
          width="100%"
          overflow="hidden"
        >
          <Image
            src={HeaderImage}
            alt="Heladeras Comunitarias"
            boxSize="100%"
            objectFit="cover"
            p={2}
          />
        </Box>
      )}
    </Flex>
  );
}

export default HeaderApp;
