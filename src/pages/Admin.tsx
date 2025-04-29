
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminUsers from "@/components/admin/AdminUsers";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();

        if (!session.session) {
          navigate("/login");
          return;
        }

        const userId = session.session.user.id;
        
        // Check if user is an admin
        const { data: adminUser, error: adminError } = await (supabase as any)
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (adminError) {
          console.error("Error checking admin status:", adminError);
          toast({
            title: "Erro",
            description: "Não foi possível verificar o status de administrador.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        if (!adminUser) {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);
        setIsSuperAdmin(adminUser.is_super_admin);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in admin authentication:", error);
        navigate("/dashboard");
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers isSuperAdmin={isSuperAdmin} />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings isSuperAdmin={isSuperAdmin} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
