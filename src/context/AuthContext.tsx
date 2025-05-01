
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
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // <- Adicione esta linha
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

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the any type to temporarily bypass TypeScript errors
      // This will work correctly once the types are regenerated
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Check if user is admin
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

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
          try {
            // Fetch user profile from profiles table
            const profile = await fetchUserProfile(session.user.id);
            
            // Check admin status
            const isAdmin = await checkAdminStatus(session.user.id);
            
            // Mock user data - in a real app, this would fetch from profiles table
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              isPro: false,
              plan: 'free',
              dailyQuota: 3,
              usedToday: 0,
              profileCompleted: profile ? profile.profile_completed : false
            };
            
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            
            if (event === 'SIGNED_IN') {
              toast({
                title: "Login bem-sucedido",
                description: "Bem-vindo ao CopySnap AI!",
              });
              
              // Redirect based on admin status and profile completion
              if (isAdmin) {
                navigate("/admin");
              } else if (profile && !profile.profile_completed) {
                navigate("/profile-completion");
              } else {
                navigate("/dashboard");
              }
            }
          } catch (error) {
            console.error("Error processing auth state change:", error);
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

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Erro de registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o registro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Erro ao entrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loginWithSocial = async (provider: Provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
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
        register,
        login,
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
