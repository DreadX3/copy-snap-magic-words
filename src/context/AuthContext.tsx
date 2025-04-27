
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  isPro: boolean;
  dailyQuota: number;
  usedToday: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      if (email && password) {
        // Mock user data
        const mockUser: User = {
          id: "user-123",
          email: email,
          isPro: false,
          dailyQuota: 3,
          usedToday: 0,
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao CopySnap AI!",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Email e senha são obrigatórios");
      }
    } catch (error) {
      toast({
        title: "Erro de login",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      if (email && password) {
        // Mock user data
        const mockUser: User = {
          id: "user-" + Math.floor(Math.random() * 1000),
          email: email,
          isPro: false,
          dailyQuota: 3,
          usedToday: 0,
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada com sucesso!",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Email e senha são obrigatórios");
      }
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o registro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
