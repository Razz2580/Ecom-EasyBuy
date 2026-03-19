import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '@/types';
import { apiService, webSocketService } from '@/services';
import { UserRole } from '@/types';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (role: typeof UserRole[keyof typeof UserRole]) => boolean;
  updateUser: (userData: AuthResponse) => void;  // <-- new
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: typeof UserRole[keyof typeof UserRole];
  storeName?: string;
  storeDescription?: string;
  address?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = apiService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      // Connect WebSocket
      webSocketService.connect();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      setUser(response);
      // Connect WebSocket after login
      webSocketService.connect();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await apiService.register(data);
      setUser(response);
      // Connect WebSocket after registration
      webSocketService.connect();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    webSocketService.disconnect();
    setUser(null);
  };

  const hasRole = (role: typeof UserRole[keyof typeof UserRole]): boolean => {
    return user?.role === role;
  };

  const updateUser = (userData: AuthResponse) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
