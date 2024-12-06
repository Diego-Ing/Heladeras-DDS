import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../config/authContext';

const CallbackPage = () => {
    const navigate = useNavigate();  
    const [isLoading, setIsLoading] = useState(true); // Estado de carga
    const { user }= useAuth();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Inicia el spinner al comenzar la carga
            setIsLoading(true);
            // Hacer el fetch al backend con el código de autorización
            fetch('https://heladeras-dds-back.onrender.com/callback?code=' + code, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                const accessToken = data.access_token;
                localStorage.setItem('access_token', accessToken);
                const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
                const userRoles = tokenPayload['scope'] ? tokenPayload['scope'].split(' ').filter(role => role) : [];
                localStorage.setItem('user_roles', JSON.stringify(userRoles));
                return fetch(process.env.REACT_APP_AUTH0_DOMAIN + '/userinfo', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
            })
            .then(userResponse => userResponse.json())
            .then(userProfile => {
                //guardo el user_profile en localStorage
                const sanitizedSub = userProfile.sub.replace('|', '');
                localStorage.setItem('user_profile', JSON.stringify(userProfile));
                //guardo el sub en localStorage
                localStorage.setItem('sub', sanitizedSub);
                
                navigate('/');
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error al intercambiar el código por un token:', error);
            })
            .finally(() => {
                // Finaliza el spinner al terminar la carga
                setIsLoading(false);
            });
        } else {
            // Oculta el spinner si no hay código
            setIsLoading(false);
        }
    }, [navigate]);

    return (
        <Center height="100vh">
            {isLoading ? (
                <Spinner size="xl" />
            ) : (
                <h1></h1>
            )}
        </Center>
    );
};

export default CallbackPage;

