
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";

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
  loginWithSocial: (provider: Provider) => Promise<void>;
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
    
    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Mock user data - in a real app, this would fetch from profiles table
          const mockUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            isPro: false,
            plan: 'free',
            dailyQuota: 3,
            usedToday: 0,
          };
          
          setUser(mockUser);
          localStorage.setItem("user", JSON.stringify(mockUser));
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo ao CopySnap AI!",
            });
            navigate("/dashboard");
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("user");
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const loginWithSocial = async (provider: Provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Erro de autenticação",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar sair",
        variant: "destructive",
      });
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithSocial,
        logout,
        isAuthenticated: !!user,
        upgradeToPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
