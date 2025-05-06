
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth.types";
import { cleanupAuthState, checkAdminStatus, fetchUserProfile, createUserObject } from "@/utils/auth.utils";

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch profile data
        const profileData = await fetchUserProfile(data.user.id);
        
        // Check admin status
        const isAdmin = await checkAdminStatus(data.user.id);
        
        // Create user object
        const userObj = createUserObject(data.user.id, data.user.email || "", profileData, isAdmin);
        
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao CopySnap AI!",
        });
        
        // Redirect based on user role
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
      
      // Clean up existing state
      cleanupAuthState();
      
      // Register via Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile for new user
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
          dailyQuota: 10, // 10 for basic plan
          usedToday: 0,
          usedMonth: 0,
          lastUsageDay: null,
          lastUsageMonth: null,
          lastUsageYear: null,
          isAdmin: false
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
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors
    }
    
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return {
    user,
    setUser,
    loading,
    setLoading,
    login,
    register,
    logout
  };
};
