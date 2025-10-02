// Hook para manejar autenticación con Discord
import { useState, useEffect } from 'react';

const AUTHORIZED_USER_ID = '608975542783574016';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

export function useDiscordAuth() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const storedAuth = localStorage.getItem('discord_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.user && authData.user.id === AUTHORIZED_USER_ID) {
          setUser(authData.user);
          setIsAuthorized(true);
        } else {
          localStorage.removeItem('discord_auth');
        }
      } catch (error) {
        localStorage.removeItem('discord_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    // Para GitHub Pages, vamos a usar un sistema simplificado
    // En producción real, esto sería Discord OAuth
    const discordId = prompt('Introduce tu Discord ID para acceder al panel de admin:');
    
    if (discordId === AUTHORIZED_USER_ID) {
      const mockUser: DiscordUser = {
        id: AUTHORIZED_USER_ID,
        username: 'withgex',
        discriminator: '0000',
        avatar: 'avatar_hash'
      };
      
      setUser(mockUser);
      setIsAuthorized(true);
      localStorage.setItem('discord_auth', JSON.stringify({ user: mockUser }));
    } else {
      alert('ID de Discord no autorizado');
    }
  };

  const logout = () => {
    localStorage.removeItem('discord_auth');
    setUser(null);
    setIsAuthorized(false);
    console.log('Sesión cerrada correctamente');
  };

  return {
    user,
    isLoading,
    isAuthorized,
    login,
    logout
  };
}