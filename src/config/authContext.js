import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [userSub, setUserSub] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const storedAccessToken = localStorage.getItem('access_token');
      const userProfile = localStorage.getItem('user_profile');
      const userRoles = localStorage.getItem('user_roles');
      const storedUserSub = localStorage.getItem('sub'); // El UUID del back
      const data = localStorage.getItem('cached_roles');
      
      if (storedAccessToken && userProfile) {
        setIsAuthenticated(true);
        setAccessToken(storedAccessToken);
        setUser(JSON.parse(userProfile));
        setRoles(JSON.parse(userRoles));
        setUserSub(storedUserSub);
        if(!data){
        try {
        const response = await fetch(`https://heladeras-dds-back.onrender.com/roles/buscar-por-uuid/${storedUserSub}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedAccessToken}`,
          }
        });
        
        if (!response.ok) {
          console.error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
          throw new Error('Error al obtener el usuario');
        }

        // Verifica si el contenido está vacío
        const content = await response.text();

        const data = JSON.parse(content);
        localStorage.setItem('cached_roles', JSON.stringify(data));
        console.log('Datos recibidos', data);
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
        try {
          const { exp } = jwtDecode(storedAccessToken);
          const currentTime = Date.now() / 1000;

          if (exp < currentTime) {
            logout();
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    fetchData();
  }, []);

  const login = () => {
    const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI;
    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
    const scope = 'openid profile email ROLE_ADMIN ROLE_COLLABORATOR ROLE_VULNERABLE ROLE_TECHNICAL';
    const loginUrl = `${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&audience=${encodeURIComponent(audience)}&prompt=login`;
    window.location.href = loginUrl;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('sub');
    localStorage.removeItem('cached_roles');
    setIsAuthenticated(false);
    setUserSub(null);
    setUser(null);
    setAccessToken(null);
    setRoles([]);
    window.location.replace('/');
  };

  return (
    <AuthContext.Provider value={{ accessToken, isAuthenticated, user, roles, login, logout, userSub }}>
      {children}
    </AuthContext.Provider>
  );
};
