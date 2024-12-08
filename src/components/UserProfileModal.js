import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  SimpleGrid,
  Image,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/authContext'; // Hook de autenticación
import LaDonate from '../assets/iconos/LaDonate.svg';
import Form from '../assets/iconos/Form.svg';
import Vianda from '../assets/iconos/Heladera.svg';
import Suscripcion from '../assets/iconos/Suscripcion.svg';
import FallaTecnica from '../assets/iconos/FallaTecnica.svg';
import Canje from '../assets/iconos/Canje.svg';
import Config from '../assets/iconos/Config.svg';
import Report from '../assets/iconos/Report.svg';
import Product from '../assets/iconos/Product.svg';
import LoadCSVModal from './LoadCSVModal'; // Modal para cargar CSV
import VisitaTecnico from '../assets/iconos/VisitaTecnico.svg';
function UserProfileModal({ isOpen, onClose }) {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Opciones disponibles según roles
  const options = [
    { path: '/visita-tecnico', img: VisitaTecnico, label: 'Registrar Visita', allowedRoles: ['ROLE_TECHNICAL'] },
    { path: '/donacion-dinero', img: LaDonate, label: 'Donar Dinero', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/donacion-vianda', img: Vianda, label: 'Donar Vianda', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/registro-vulnerable', img: Form, label: 'Registrar Persona Vulnerable', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/suscripcion-heladera', img: Suscripcion, label: 'Suscribirse', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/report-issue', img: FallaTecnica, label: 'Reportar Falla Técnica', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/consulta-canje', img: Canje, label: 'Consultar o Canjear productos', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/reportes', img: Report, label: 'Reportes', allowedRoles: ['ROLE_ADMIN'] },
    { path: '/publicar-producto', img: Product, label: 'Publicar Producto/Servicio', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/cargar-heladera', img: Product, label: 'Cargar Heladera', allowedRoles: ['ROLE_ADMIN'] },
    { path: '/distribucion-viandas', img: Product, label: 'Distribución Viandas', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { path: '/reconocimientos-extra', img: Product, label: 'Reconocimeintos Extra', allowedRoles: ['ROLE_ADMIN', 'ROLE_COLLABORATOR'] },
    { action: () => setIsCSVModalOpen(true), img: Product, label: 'Cargar CSV', allowedRoles: ['ROLE_ADMIN'] },
  ];

  // Filtra las opciones por los roles del usuario
  const filteredOptions = options.filter(option =>
    roles.some(role => option.allowedRoles.includes(role))
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader textAlign="center">Opciones de Usuario</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {user?.email_verified ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          {filteredOptions.map((item, index) => (
            <Box
              key={index}
              onClick={() =>
                item.action ? item.action() : (navigate(item.path), onClose())
              }
              cursor="pointer"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={4}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ bg: 'gray.100' }}
              width="130px"
              minHeight="120px"
            >
              <Image src={item.img} alt={item.label} boxSize="60px" />
              <Text mt={2} textAlign="center">
                {item.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Flex justify="center" align="center" minHeight="150px">
          <Text textAlign="center" fontWeight="bold" color="red.500">
            Por favor, verifica tu email para acceder a estas opciones, si ya lo hiciste por favor vuelve a iniciar sesion.
          </Text>
        </Flex>
      )}
    </ModalBody>
  </ModalContent>
</Modal>


      {/* Modal para cargar CSV */}
      <LoadCSVModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} />
    </>
  );
}

export default UserProfileModal;
