import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import UTNlogo from '../assets/logos/utn.svg';
import IcoProfile from '../assets/iconos/IcoProfile.svg';
import IcoHeladera from '../assets/iconos/IcoHeladera.svg';
import { useAuth0 } from '@auth0/auth0-react'; // Importa el hook de Auth0
import '../assets/styles/CustomContainer.css';

function NavApp({ className }) {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0(); // Desestructuramos el hook de Auth0
  const [expanded, setExpanded] = useState(false);

  const handleResize = () => {
    if (window.innerWidth >= 992 && expanded) {
      setExpanded(false);
    }
  };

  const handleNavLinkClick = () => {
    setExpanded(false); // Colapsa el Navbar al hacer clic en un enlace de navegación
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [expanded]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Usuario logueado:", {
        nombre: user.name,
        email: user.email,
        sub: user.sub // Puedes agregar más propiedades si lo deseas
      });
    }
  }, [isAuthenticated, user]); // Ejecuta el efecto cuando cambia la autenticación o el usuario

  return (
    <Navbar
      className={`Nav-Bar ${className}`}
      expand="lg"
      fixed="top"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      style={{ zIndex: 1050 }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fs-3 d-flex align-items-center">
          <img
            alt=""
            src={UTNlogo}
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          {' Heladeras DDS'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
          <Nav>
            {isAuthenticated ? ( // Verifica si el usuario está autenticado
              <>
                <Nav.Link href="#profile" onClick={handleNavLinkClick} className="fs-5">
                  <img
                    alt=""
                    src={IcoProfile}
                    width="25"
                    height="25"
                    className="d-inline-block me-2"
                  />
                  {user.name} {/* Muestra el nombre del usuario autenticado */}
                </Nav.Link>
                <Nav.Link href="#logout" onClick={() => logout({ returnTo: window.location.origin })} className="fs-5">
                  Cerrar sesión
                </Nav.Link>
              </>
            ) : (
              <Nav.Link href="#login" onClick={loginWithRedirect} className="fs-5">
                <img
                  alt=""
                  src={IcoProfile}
                  width="30"
                  height="30"
                  className="d-inline-block me-2"
                />
                {' Ingresar'}
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/map" onClick={handleNavLinkClick} className="fs-5">
              <img
                alt=""
                src={IcoHeladera}
                width="30"
                height="30"
                className="d-inline-block me-2"
              />
              {' Heladeras'}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavApp;
