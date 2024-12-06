import React, { useState } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Collapse,
  Heading,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const reportTypes = [
  { label: 'Fallas por heladera', section: 'fallas' },
  { label: 'Viandas por heladera', section: 'viandas-heladeras' },
  { label: 'Viandas por colaborador', section: 'viandas-colaboradores' },
];

const SeccionReporte = ({ clase, columnas, data, openSection }) => (
  <Collapse in={openSection === clase} animateOpacity>
    <Box className={clase} bg="lightblue" p={4} mt={4} borderRadius="md">
      <Box fontWeight="bold" display="grid" gridTemplateColumns={`repeat(${columnas.length}, 1fr)`} gap={2}>
        {columnas.map((columna) => (
          <Box key={columna}>{columna}</Box>
        ))}
      </Box>
      {data.map((elemento, index) => (
        <Box key={index} display="grid" gridTemplateColumns={`repeat(${columnas.length}, 1fr)`} gap={2} mt={2}>
          {Object.values(elemento).map((value, i) => (
            <Box key={i}>{value}</Box>
          ))}
        </Box>
      ))}
    </Box>
  </Collapse>
);

function ReportesPage() {
  const [openSection, setOpenSection] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState({
    "fallas": [],
    "viandas-heladeras": [],
    "viandas-colaboradores": [],
  });

  // Función para obtener el token desde localStorage
  const getToken = () => localStorage.getItem('access_token'); // O el lugar donde guardas el token

  const fetchReportData = async (section) => {
    const urls = {
      fallas: 'https://heladeras-dds-back.onrender.com/reportes/fallas/ultima-semana',
      'viandas-heladeras': 'https://heladeras-dds-back.onrender.com/reportes/viandas/heladera/ultima-semana',
      'viandas-colaboradores': 'https://heladeras-dds-back.onrender.com/reportes/viandas/colaborador/ultima-semana',
    };

    const token = getToken(); // Obtén el token de localStorage

    if (!token) {
      console.error('No se encontró el token de autenticación.');
      return;
    }

    try {
      const response = await fetch(urls[section], {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Incluir el token en la cabecera
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener los datos: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setReportData(prevData => ({
          ...prevData,
          [section]: data,
        }));
      } else {
        throw new Error('La respuesta no es un JSON');
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const handleMenuClick = (section, label) => {
    setOpenSection(prevSection => (prevSection === section ? null : section));
    setSelectedReport(prevSection => (prevSection === label ? null : label));
    fetchReportData(section); // Fetch data when a section is selected
  };

  return (
    <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" bg="transparent">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" width="80vw" height="80vh" overflow="auto">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Seleccionar tipo de reporte
          </MenuButton>
          <MenuList>
            {reportTypes.map((report) => (
              <MenuItem key={report.section} onClick={() => handleMenuClick(report.section, report.label)}>
                {report.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {selectedReport ? (
          <>
            <Heading as="h2" size="lg" mt={4} mb={4} textAlign="center">
              {`Reporte: ${selectedReport}`}
            </Heading>

            <SeccionReporte
              clase="fallas"
              columnas={['Heladera', 'Fallas']}
              data={reportData['fallas']}
              openSection={openSection}
            />

            <SeccionReporte
              clase="viandas-heladeras"
              columnas={['Heladera', 'Viandas retiradas', 'Viandas colocadas']}
              data={reportData['viandas-heladeras']}
              openSection={openSection}
            />

            <SeccionReporte
              clase="viandas-colaboradores"
              columnas={['Colaborador', 'Viandas donadas']}
              data={reportData['viandas-colaboradores']}
              openSection={openSection}
            />
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <Text fontSize="2xl" color="gray.500">
              Seleccione un tipo de reporte a mostrar
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ReportesPage;
