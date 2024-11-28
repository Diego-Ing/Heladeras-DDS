import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavApp from './components/NavApp';
import HeaderApp from './components/HeaderApp';
import MapApp from './components/MapApp';
import ReportIssuePage from './pages/ReportIssuePage.js';
import ConsultaCanjePage from './pages/ConsultaCanjePage.js';
import PublicarProductoPage from './pages/PublicarProductoPage.js';
import RegistrarVulnerable from './pages/RegistrarVulnerablePage.js';
import RecomendarPuntos from './pages/RecomendarPuntosPage.js';
import Reportes from './pages/ReportesPage.js';
import InfoApp from './components/InfoApp';
import DonacionDineroPage from './pages/DonacionDineroPage.js';
import DonacionViandaPage from './pages/DonacionViandaPage.js';
import CargarHeladeraPage from './pages/CargarHeladeraPage.js';
import DistribucionViandasPage from './pages/DistribucionViandasPage.js';
import SuscripcionHeladeraPage from './pages/SuscripcionHeladeraPage.js';
import VisitaTecnicoPage from './pages/VisitaTenicoPage.js';
import ReconocimientosExtraPage from './pages/ReconocimientosExtraPage.js';
import PersonaPage from './pages/PersonaPage.js';
import CallbackPage from './pages/CallBackPage.js';
import AccesoDenegadoPage from './pages/AccesoDenegadoPage';
import { AuthProvider } from './config/authContext.js';
import { Auth0Provider } from '@auth0/auth0-react';
import RoleProtectedRoute from './config/RoleProtectedRoute';
import { ChakraProvider } from '@chakra-ui/react';  // Importar ChakraProvider
import theme from './Theme/theme';
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI;

function App() {
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <ChakraProvider theme={theme}>  {/* Envolviendo la app con ChakraProvider */}
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        redirectUri={redirectUri}
      >
        <AuthProvider>
          <Router>
            <Main setHeaderHeight={setHeaderHeight} headerHeight={headerHeight} />
          </Router>
        </AuthProvider>
      </Auth0Provider>
    </ChakraProvider>
  );
}

function Main({ setHeaderHeight, headerHeight }) {
  const location = useLocation();

  return (
    <>
      <NavApp />

      {location.pathname === '/' && (
        <div className="header-info-container">
          <HeaderApp setHeaderHeight={setHeaderHeight} />
          <div>
            <InfoApp />
          </div>
        </div>
      )}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<></>} />
        <Route path="/map" element={<MapApp />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/acceso-denegado" element={<AccesoDenegadoPage />} />
        <Route path="/persona-form" element={<PersonaPage/>} />
        {/* Rutas protegidas con roles */}
        <Route path="/report-issue" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <ReportIssuePage />
          </RoleProtectedRoute>
        } />
        <Route path="/consulta-canje" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <ConsultaCanjePage />
          </RoleProtectedRoute>
        } />
        <Route path="/publicar-producto" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <PublicarProductoPage />
          </RoleProtectedRoute>
        } />
        <Route path="/registro-vulnerable" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <RegistrarVulnerable />
          </RoleProtectedRoute>
        } />
        <Route path="/recomendar-puntos" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <RecomendarPuntos />
          </RoleProtectedRoute>
        } />
        <Route path="/reportes" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <Reportes />
          </RoleProtectedRoute>
        } />
        <Route path="/donacion-dinero" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <DonacionDineroPage />
          </RoleProtectedRoute>
        } />
        <Route path="/donacion-vianda" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <DonacionViandaPage />
          </RoleProtectedRoute>
        } />
        <Route path="/cargar-heladera" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <CargarHeladeraPage />
          </RoleProtectedRoute>
        } />

        <Route path="/distribucion-viandas" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <DistribucionViandasPage />
          </RoleProtectedRoute>
        } />
        <Route path="/suscripcion-heladera" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <SuscripcionHeladeraPage />
          </RoleProtectedRoute>
        } />

        <Route path="/visita-tecnico" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <VisitaTecnicoPage />
          </RoleProtectedRoute>
        } />


        <Route path="/reconocimientos-extra" element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_COLLABORATOR']}>
            <ReconocimientosExtraPage />
          </RoleProtectedRoute>
        } />
        <Route path="/persona-form" element={
          <RoleProtectedRoute allowedRoles={['']}>
            <ReconocimientosExtraPage />
          </RoleProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
