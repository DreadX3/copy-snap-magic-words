
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, CreditCard, LoaderCircle, Lock, Mail, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      setSubscriptionError(null);
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSubscriptionData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao verificar assinatura";
      setSubscriptionError(message);
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setIsLoadingSubscription(true);
      
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal não encontrada na resposta");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao abrir portal do cliente";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      console.error("Error opening customer portal:", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setIsUpdatingEmail(true);
      
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast({
        title: "Email atualizado",
        description: "Um link de confirmação foi enviado para seu novo email",
        variant: "default",
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar o email";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setIsUpdatingPassword(true);
      
      if (!password || password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem");
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
        variant: "default",
      });
      
      // Reset password fields
      setPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar a senha";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">Perfil do Usuário</h1>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Conta
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Assinatura
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                  <CardDescription>
                    Atualize as informações da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleUpdateEmail}
                    disabled={isUpdatingEmail || email === user?.email}
                  >
                    {isUpdatingEmail ? (
                      <>
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Atualizar Email
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Atualize sua senha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !password || password !== confirmPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Atualizar Senha
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Assinatura</CardTitle>
                  <CardDescription>
                    Visualize e gerencie sua assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingSubscription ? (
                    <div className="flex justify-center items-center py-8">
                      <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" />
                    </div>
                  ) : subscriptionError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro</AlertTitle>
                      <AlertDescription>
                        {subscriptionError}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="font-medium flex items-center">
                          Status: 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            subscriptionData?.subscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {subscriptionData?.subscribed ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          Plano: {subscriptionData?.subscribed ? "PRO" : "Básico"}
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-500">
                          {subscriptionData?.subscribed ? (
                            <>Válido até: {new Date(subscriptionData?.subscription_end).toLocaleDateString("pt-BR")}</>
                          ) : (
                            <>
                              <div>Limite diário: {subscriptionData?.dailyQuota || 10} gerações</div>
                              <div>Limite mensal: {subscriptionData?.monthlyQuota || 50} gerações</div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {subscriptionData?.subscribed ? (
                        <Alert className="bg-brand-50 text-brand-800 border-brand-200">
                          <Check className="h-4 w-4 text-brand-500" />
                          <AlertTitle>Plano PRO ativo</AlertTitle>
                          <AlertDescription>
                            Você tem acesso a todas as funcionalidades premium do CopySnap AI.
                            Use o portal do cliente para gerenciar sua assinatura.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert>
                          <AlertTitle>Plano Básico</AlertTitle>
                          <AlertDescription>
                            Atualize para o plano PRO e tenha acesso ilimitado a todas as funcionalidades.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button 
                    onClick={checkSubscription}
                    variant="outline"
                    disabled={isLoadingSubscription}
                  >
                    {isLoadingSubscription ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      "Atualizar Status"
                    )}
                  </Button>
                  
                  <Button 
                    onClick={openCustomerPortal}
                    disabled={isLoadingSubscription || !subscriptionData?.subscribed}
                    variant={subscriptionData?.subscribed ? "default" : "outline"}
                  >
                    {isLoadingSubscription ? (
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Gerenciar Assinatura
                  </Button>
                  
                  {!subscriptionData?.subscribed && (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="bg-brand-500 hover:bg-brand-600"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Assinar PRO
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
