import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  CalendarDays, 
  Users, 
  UserCheck, 
  Share, 
  TrendingUp
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  usersLast24h: number;
  usersLast7d: number;
  usersLast30d: number;
  usersLast60d: number;
  usersLast90d: number;
  generationsLast24h: number;
  generationsLast7d: number;
  generationsLast30d: number;
  generationsLast60d: number;
  generationsLast90d: number;
  sharesLast24h: number;
  sharesLast7d: number;
  sharesLast30d: number;
  sharesLast60d: number;
  sharesLast90d: number;
}

interface TimeRangeData {
  label: string;
  users: number;
  generations: number;
  shares: number;
}

const AdminDashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [timeRangeData, setTimeRangeData] = useState<TimeRangeData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se o usuário é administrador
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const checkIfIsAdmin = async () => {
      if (!user) return;

      console.log("Verificando se o usuário é admin:", user.email);
      
      // Verificar se usuário específico é admin (para debug)
      if (user.email === "dreadx3@gmail.com") {
        console.log("Usuário dreadx3@gmail.com detectado, garantindo acesso admin");
        // Verificar se já existe na tabela admin_users
        const { data: existingAdmin } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        // Se não existir, adicionar como admin
        if (!existingAdmin) {
          console.log("Adicionando dreadx3@gmail.com como admin");
          await supabase
            .from("admin_users")
            .insert({ user_id: user.id });
        }
        
        setIsAdmin(true);
        fetchStats();
        return;
      }

      // Verificação normal para outros usuários
      if (user.isAdmin) {
        console.log("Usuário é admin pelo contexto");
        setIsAdmin(true);
        fetchStats();
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("Admin check result:", data, error);

      if (error) {
        console.error("Erro ao verificar se é admin:", error);
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      if (data) {
        console.log("Usuário confirmado como admin");
        setIsAdmin(true);
        fetchStats();
      } else {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    checkIfIsAdmin();
  }, [user, loading, isAuthenticated, navigate, toast]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      // Obter o total de usuários divididos em pro e free
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_pro, registered_at");

      if (profilesError) throw profilesError;

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Filtrar usuários por data de registro
      const proUsers = profilesData?.filter(user => user.is_pro) || [];
      const freeUsers = profilesData?.filter(user => !user.is_pro) || [];
      
      const usersLast24h = profilesData?.filter(user => {
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= oneDayAgo;
      }).length || 0;
      
      const usersLast7d = profilesData?.filter(user => {
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= sevenDaysAgo;
      }).length || 0;
      
      const usersLast30d = profilesData?.filter(user => {
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= thirtyDaysAgo;
      }).length || 0;
      
      const usersLast60d = profilesData?.filter(user => {
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= sixtyDaysAgo;
      }).length || 0;
      
      const usersLast90d = profilesData?.filter(user => {
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= ninetyDaysAgo;
      }).length || 0;

      // Obter gerações de conteúdo
      const { data: generationsData, error: generationsError } = await supabase
        .from("text_generation_requests")
        .select("id, created_at");

      if (generationsError) throw generationsError;

      // Contar gerações por período
      const generationsLast24h = generationsData?.filter(gen => {
        const createdAt = new Date(gen.created_at);
        return createdAt >= oneDayAgo;
      }).length || 0;
      
      const generationsLast7d = generationsData?.filter(gen => {
        const createdAt = new Date(gen.created_at);
        return createdAt >= sevenDaysAgo;
      }).length || 0;
      
      const generationsLast30d = generationsData?.filter(gen => {
        const createdAt = new Date(gen.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length || 0;
      
      const generationsLast60d = generationsData?.filter(gen => {
        const createdAt = new Date(gen.created_at);
        return createdAt >= sixtyDaysAgo;
      }).length || 0;
      
      const generationsLast90d = generationsData?.filter(gen => {
        const createdAt = new Date(gen.created_at);
        return createdAt >= ninetyDaysAgo;
      }).length || 0;

      // Obter compartilhamentos
      const { data: sharesData, error: sharesError } = await supabase
        .from("content_shares")
        .select("id, created_at");

      if (sharesError) throw sharesError;

      // Contar compartilhamentos por período
      const sharesLast24h = sharesData?.filter(share => {
        const createdAt = new Date(share.created_at);
        return createdAt >= oneDayAgo;
      }).length || 0;
      
      const sharesLast7d = sharesData?.filter(share => {
        const createdAt = new Date(share.created_at);
        return createdAt >= sevenDaysAgo;
      }).length || 0;
      
      const sharesLast30d = sharesData?.filter(share => {
        const createdAt = new Date(share.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length || 0;
      
      const sharesLast60d = sharesData?.filter(share => {
        const createdAt = new Date(share.created_at);
        return createdAt >= sixtyDaysAgo;
      }).length || 0;
      
      const sharesLast90d = sharesData?.filter(share => {
        const createdAt = new Date(share.created_at);
        return createdAt >= ninetyDaysAgo;
      }).length || 0;

      // Configurar dados para os gráficos de tempo
      const timeData: TimeRangeData[] = [
        { label: "24 horas", users: usersLast24h, generations: generationsLast24h, shares: sharesLast24h },
        { label: "7 dias", users: usersLast7d, generations: generationsLast7d, shares: sharesLast7d },
        { label: "30 dias", users: usersLast30d, generations: generationsLast30d, shares: sharesLast30d },
        { label: "60 dias", users: usersLast60d, generations: generationsLast60d, shares: sharesLast60d },
        { label: "90 dias", users: usersLast90d, generations: generationsLast90d, shares: sharesLast90d }
      ];

      setTimeRangeData(timeData);

      // Atualizar as estatísticas
      setStats({
        totalUsers: profilesData?.length || 0,
        proUsers: proUsers.length,
        freeUsers: freeUsers.length,
        usersLast24h,
        usersLast7d,
        usersLast30d,
        usersLast60d,
        usersLast90d,
        generationsLast24h,
        generationsLast7d,
        generationsLast30d,
        generationsLast60d,
        generationsLast90d,
        sharesLast24h,
        sharesLast7d,
        sharesLast30d,
        sharesLast60d,
        sharesLast90d
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast({
        title: "Erro ao buscar estatísticas",
        description: "Não foi possível carregar as estatísticas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !isAdmin) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard de Administrador</h1>
          
          {loadingStats ? (
            <div className="grid place-items-center h-64">
              <div className="text-lg">Carregando estatísticas...</div>
            </div>
          ) : (
            <>
              {/* Resumo de usuários */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Resumo de Usuários</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="mr-2" /> 
                        Total de Usuários
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                      <div className="grid grid-cols-2 mt-4">
                        <div>
                          <div className="text-sm text-gray-500">PRO</div>
                          <div className="text-xl font-semibold">{stats?.proUsers || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Gratuitos</div>
                          <div className="text-xl font-semibold">{stats?.freeUsers || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CalendarDays className="mr-2" /> 
                        Novos Usuários
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">24 horas</div>
                          <div className="text-lg font-semibold">{stats?.usersLast24h || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">7 dias</div>
                          <div className="text-lg font-semibold">{stats?.usersLast7d || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="mr-2" /> 
                        Atividade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Gerações</div>
                          <div className="text-lg font-semibold">{stats?.generationsLast30d || 0}</div>
                          <div className="text-xs text-gray-500">últimos 30 dias</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Compartilhamentos</div>
                          <div className="text-lg font-semibold">{stats?.sharesLast30d || 0}</div>
                          <div className="text-xs text-gray-500">últimos 30 dias</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
              
              {/* Gráficos de Tendências */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Estatísticas por Período</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Crescimento & Atividade</CardTitle>
                    <CardDescription>Usuários, gerações e compartilhamentos por período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer className="h-[400px]" config={{}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeRangeData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="users" fill="#8884d8" name="Usuários" />
                          <Bar dataKey="generations" fill="#82ca9d" name="Gerações" />
                          <Bar dataKey="shares" fill="#ffc658" name="Compartilhamentos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </section>
              
              {/* Tabela detalhada */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Estatísticas Detalhadas</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas por Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Novos Usuários</TableHead>
                          <TableHead>Gerações</TableHead>
                          <TableHead>Compartilhamentos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">24 horas</TableCell>
                          <TableCell>{stats?.usersLast24h || 0}</TableCell>
                          <TableCell>{stats?.generationsLast24h || 0}</TableCell>
                          <TableCell>{stats?.sharesLast24h || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">7 dias</TableCell>
                          <TableCell>{stats?.usersLast7d || 0}</TableCell>
                          <TableCell>{stats?.generationsLast7d || 0}</TableCell>
                          <TableCell>{stats?.sharesLast7d || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">30 dias</TableCell>
                          <TableCell>{stats?.usersLast30d || 0}</TableCell>
                          <TableCell>{stats?.generationsLast30d || 0}</TableCell>
                          <TableCell>{stats?.sharesLast30d || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">60 dias</TableCell>
                          <TableCell>{stats?.usersLast60d || 0}</TableCell>
                          <TableCell>{stats?.generationsLast60d || 0}</TableCell>
                          <TableCell>{stats?.sharesLast60d || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">90 dias</TableCell>
                          <TableCell>{stats?.usersLast90d || 0}</TableCell>
                          <TableCell>{stats?.generationsLast90d || 0}</TableCell>
                          <TableCell>{stats?.sharesLast90d || 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
