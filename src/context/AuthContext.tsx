
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  isPro: boolean;
  dailyQuota: number;
  usedToday: number;
  isAdmin: boolean; // Adicionando propriedade isAdmin
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

  // Carregar usuário do localStorage ou do Supabase ao montar
  useEffect(() => {
    const loadUser = async () => {
      // Verificar se há sessão ativa no Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Se tiver sessão no Supabase, buscar dados do perfil
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (!error && profileData) {
          // Verificar se é admin
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          console.log("Admin data:", adminData, "Admin error:", adminError);
          
          const isAdmin = adminError ? false : !!adminData;
          
          const userObj: User = {
            id: session.user.id,
            email: session.user.email || "",
            isPro: profileData.is_pro || false,
            dailyQuota: profileData.is_pro ? 999 : 3, // Ilimitado para PRO ou 3 para gratuito
            usedToday: 0, // Poderia ser calculado com base em logs, se existir
            isAdmin: isAdmin
          };
          
          setUser(userObj);
          localStorage.setItem("user", JSON.stringify(userObj));
          
          // Se for admin, redirecionar para o painel admin
          if (isAdmin && window.location.pathname === '/login') {
            navigate('/admin');
          }
        } else {
          console.error("Erro ao buscar perfil:", error);
        }
      } else {
        // Sem sessão Supabase, tenta carregar do localStorage (fallback para demo)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Tentar login via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Buscar dados do perfil após login
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 significa que não encontrou registros, neste caso criamos um novo perfil
          console.error("Erro ao buscar perfil:", profileError);
        }

        // Verificar se é admin
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        console.log("Login admin data:", adminData, "Admin error:", adminError);
        
        const isAdmin = adminError ? false : !!adminData;
        
        // Para demonstração, se não encontrar perfil, criar um novo
        const userObj: User = {
          id: data.user.id,
          email: data.user.email || "",
          isPro: profileData?.is_pro || false,
          dailyQuota: profileData?.is_pro ? 999 : 3,
          usedToday: 0,
          isAdmin: isAdmin
        };
        
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao CopySnap AI!",
        });
        
        // Redirecionar admin para dashboard admin
        if (isAdmin) {
          console.log("Redirecionando para /admin");
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
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
      
      // Registrar via Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Criar perfil para o novo usuário
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            { 
              id: data.user.id,
              is_pro: false,
              registered_at: new Date().toISOString()
            }
          ]);
          
        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
        }
        
        const userObj: User = {
          id: data.user.id,
          email: data.user.email || "",
          isPro: false,
          dailyQuota: 3,
          usedToday: 0,
          isAdmin: false // Adding the isAdmin property with default value false
        };
        
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada com sucesso!",
        });
        navigate("/dashboard");
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

  const logout = async () => {
    // Logout do Supabase
    await supabase.auth.signOut();
    
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
