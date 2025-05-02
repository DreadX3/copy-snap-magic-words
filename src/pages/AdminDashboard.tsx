
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CalendarDays, 
  Users, 
  UserCheck, 
  Share, 
  TrendingUp,
  Calendar
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  usersInPeriod: number;
  generationsInPeriod: number;
  sharesInPeriod: number;
}

interface TimeRangeData {
  label: string;
  users: number;
  generations: number;
  shares: number;
}

type PeriodType = "24h" | "7d" | "30d" | "60d" | "90d" | "all";

const periodOptions = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "60d", label: "Últimos 60 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "all", label: "Todo período" }
];

const AdminDashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [timeRangeData, setTimeRangeData] = useState<TimeRangeData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("30d");
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
        fetchStats(selectedPeriod);
        return;
      }

      // Verificação normal para outros usuários
      if (user.isAdmin) {
        console.log("Usuário é admin pelo contexto");
        setIsAdmin(true);
        fetchStats(selectedPeriod);
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
        fetchStats(selectedPeriod);
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
  }, [user, loading, isAuthenticated, navigate, toast, selectedPeriod]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    fetchStats(period);
  };

  const getDateForPeriod = (period: PeriodType): Date | null => {
    const now = new Date();
    
    switch (period) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "60d":
        return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "all":
        return null; // Retorna null para indicar todos os períodos
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const fetchStats = async (period: PeriodType) => {
    try {
      setLoadingStats(true);

      // Obter o total de usuários divididos em pro e free
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_pro, registered_at");

      if (profilesError) throw profilesError;

      const startDate = getDateForPeriod(period);
      
      // Filtrar usuários por data de registro
      const proUsers = profilesData?.filter(user => user.is_pro) || [];
      const freeUsers = profilesData?.filter(user => !user.is_pro) || [];
      
      const usersInPeriod = profilesData?.filter(user => {
        if (!startDate) return true; // Se for "all", incluir todos
        const registeredAt = new Date(user.registered_at || '');
        return registeredAt >= startDate;
      }).length || 0;

      // Obter gerações de conteúdo
      const { data: generationsData, error: generationsError } = await supabase
        .from("text_generation_requests")
        .select("id, created_at");

      if (generationsError) throw generationsError;

      // Contar gerações por período
      const generationsInPeriod = generationsData?.filter(gen => {
        if (!startDate) return true; // Se for "all", incluir todos
        const createdAt = new Date(gen.created_at);
        return createdAt >= startDate;
      }).length || 0;

      // Obter compartilhamentos
      const { data: sharesData, error: sharesError } = await supabase
        .from("content_shares")
        .select("id, created_at");

      if (sharesError) throw sharesError;

      // Contar compartilhamentos por período
      const sharesInPeriod = sharesData?.filter(share => {
        if (!startDate) return true; // Se for "all", incluir todos
        const createdAt = new Date(share.created_at);
        return createdAt >= startDate;
      }).length || 0;

      // Configurar dados para os gráficos de tempo
      // Para o gráfico, sempre mostramos dados de vários períodos
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const timeData: TimeRangeData[] = [
        { 
          label: "24 horas", 
          users: profilesData?.filter(u => new Date(u.registered_at || '') >= oneDayAgo).length || 0,
          generations: generationsData?.filter(g => new Date(g.created_at) >= oneDayAgo).length || 0,
          shares: sharesData?.filter(s => new Date(s.created_at) >= oneDayAgo).length || 0 
        },
        { 
          label: "7 dias", 
          users: profilesData?.filter(u => new Date(u.registered_at || '') >= sevenDaysAgo).length || 0,
          generations: generationsData?.filter(g => new Date(g.created_at) >= sevenDaysAgo).length || 0,
          shares: sharesData?.filter(s => new Date(s.created_at) >= sevenDaysAgo).length || 0 
        },
        { 
          label: "30 dias", 
          users: profilesData?.filter(u => new Date(u.registered_at || '') >= thirtyDaysAgo).length || 0,
          generations: generationsData?.filter(g => new Date(g.created_at) >= thirtyDaysAgo).length || 0,
          shares: sharesData?.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length || 0 
        },
        { 
          label: "60 dias", 
          users: profilesData?.filter(u => new Date(u.registered_at || '') >= sixtyDaysAgo).length || 0,
          generations: generationsData?.filter(g => new Date(g.created_at) >= sixtyDaysAgo).length || 0,
          shares: sharesData?.filter(s => new Date(s.created_at) >= sixtyDaysAgo).length || 0 
        },
        { 
          label: "90 dias", 
          users: profilesData?.filter(u => new Date(u.registered_at || '') >= ninetyDaysAgo).length || 0,
          generations: generationsData?.filter(g => new Date(g.created_at) >= ninetyDaysAgo).length || 0,
          shares: sharesData?.filter(s => new Date(s.created_at) >= ninetyDaysAgo).length || 0 
        }
      ];

      setTimeRangeData(timeData);

      // Atualizar as estatísticas
      setStats({
        totalUsers: profilesData?.length || 0,
        proUsers: proUsers.length,
        freeUsers: freeUsers.length,
        usersInPeriod,
        generationsInPeriod,
        sharesInPeriod
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

  const getPeriodLabel = (period: PeriodType): string => {
    const option = periodOptions.find(opt => opt.value === period);
    return option ? option.label : "Período selecionado";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0">Dashboard de Administrador</h1>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <Select
                value={selectedPeriod}
                onValueChange={(value) => handlePeriodChange(value as PeriodType)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
                      <div className="text-lg font-semibold">{stats?.usersInPeriod || 0}</div>
                      <div className="text-sm text-gray-500">{getPeriodLabel(selectedPeriod)}</div>
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
                          <div className="text-lg font-semibold">{stats?.generationsInPeriod || 0}</div>
                          <div className="text-xs text-gray-500">{getPeriodLabel(selectedPeriod)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Compartilhamentos</div>
                          <div className="text-lg font-semibold">{stats?.sharesInPeriod || 0}</div>
                          <div className="text-xs text-gray-500">{getPeriodLabel(selectedPeriod)}</div>
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
                        {timeRangeData.map((item) => (
                          <TableRow key={item.label}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell>{item.users}</TableCell>
                            <TableCell>{item.generations}</TableCell>
                            <TableCell>{item.shares}</TableCell>
                          </TableRow>
                        ))}
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
