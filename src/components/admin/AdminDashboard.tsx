
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  label: string;
  users: number;
  requests: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error("Error fetching users count:", usersError);
        }

        // Get total requests count
        const { count: requestsCount, error: requestsError } = await supabase
          .from('text_generation_requests')
          .select('*', { count: 'exact', head: true });

        if (requestsError) {
          console.error("Error fetching requests count:", requestsError);
        }

        // Calculate stats for each time period
        const now = new Date();
        
        // Create an array of time periods to query
        const timePeriods = [
          { label: "24 horas", days: 1 },
          { label: "7 dias", days: 7 },
          { label: "30 dias", days: 30 },
          { label: "6 meses", days: 180 },
          { label: "1 ano", days: 365 }
        ];

        const statsData = await Promise.all(timePeriods.map(async ({ label, days }) => {
          const fromDate = new Date();
          fromDate.setDate(now.getDate() - days);
          
          // Count users in this period
          const { count: periodUsers, error: periodUsersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', fromDate.toISOString());

          if (periodUsersError) {
            console.error(`Error fetching ${label} users:`, periodUsersError);
          }

          // Count requests in this period
          const { count: periodRequests, error: periodRequestsError } = await supabase
            .from('text_generation_requests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', fromDate.toISOString());

          if (periodRequestsError) {
            console.error(`Error fetching ${label} requests:`, periodRequestsError);
          }

          return {
            label,
            users: periodUsers || 0,
            requests: periodRequests || 0,
          };
        }));

        setStats([...statsData]);
        setTotalUsers(usersCount || 0);
        setTotalRequests(requestsCount || 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    users: {
      label: "Usuários",
      theme: {
        light: "hsl(var(--chart-1))",
        dark: "hsl(var(--chart-1))",
      },
    },
    requests: {
      label: "Gerações",
      theme: {
        light: "hsl(var(--chart-2))",
        dark: "hsl(var(--chart-2))",
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gerações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Gerações de texto
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.find(s => s.label === "24 horas")?.users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 24 horas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Gerações (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.find(s => s.label === "24 horas")?.requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Período</CardTitle>
          <CardDescription>
            Usuários registrados e gerações de texto por período de tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Legend
                  align="right"
                  verticalAlign="top"
                  content={(props) => (
                    <ChartLegendContent
                      {...props}
                      className="justify-end"
                    />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Detalhadas</CardTitle>
          <CardDescription>
            Registros e gerações por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium">Usuários Registrados</h3>
              <div className="mt-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Período</th>
                      <th className="text-right py-2">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.label} className="border-b">
                        <td className="py-2">{stat.label}</td>
                        <td className="text-right py-2">{stat.users}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 font-medium">Total</td>
                      <td className="text-right py-2 font-medium">{totalUsers}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Gerações de Texto</h3>
              <div className="mt-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Período</th>
                      <th className="text-right py-2">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.label} className="border-b">
                        <td className="py-2">{stat.label}</td>
                        <td className="text-right py-2">{stat.requests}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 font-medium">Total</td>
                      <td className="text-right py-2 font-medium">{totalRequests}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
