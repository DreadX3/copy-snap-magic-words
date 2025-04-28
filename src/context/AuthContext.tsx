
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  isPro: boolean;
  dailyQuota: number;
  usedToday: number;
  plan: 'free' | 'pro';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  upgradeToPro: () => Promise<void>;
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
          plan: 'free',
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
          plan: 'free',
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

  const upgradeToPro = async () => {
    try {
      setLoading(true);
      // Simulate upgrading to PRO plan
      if (user) {
        const updatedUser = {
          ...user,
          isPro: true,
          plan: 'pro' as const,
          dailyQuota: Infinity,
        };
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast({
          title: "Plano atualizado!",
          description: "Você agora tem acesso ao plano PRO com gerações ilimitadas.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar plano",
        description: "Não foi possível atualizar para o plano PRO. Tente novamente.",
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
        upgradeToPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
