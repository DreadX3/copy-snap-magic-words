
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UsageStats from "@/components/UsageStats";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, CreditCard, History, LoaderCircle, PlusCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const SidePanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não encontrada na resposta");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao iniciar checkout";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      console.error("Error initiating checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <UsageStats />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Favoritos</CardTitle>
          <CardDescription>
            Acesse seus textos favoritos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard?view=favorites">
            <Button 
              variant="outline" 
              className="w-full"
            >
              <BookmarkIcon className="mr-2 h-4 w-4" />
              Ver favoritos
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Histórico</CardTitle>
          <CardDescription>
            Acesse suas gerações anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard?view=history">
            <Button 
              variant="outline" 
              className="w-full"
            >
              <History className="mr-2 h-4 w-4" />
              Ver histórico
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Perfil e Configurações</CardTitle>
          <CardDescription>
            Gerencie sua conta e assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full mb-2"
            onClick={() => navigate("/profile")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar Perfil
          </Button>
          
          {!user?.isPro && (
            <Button 
              className="w-full bg-brand-500 hover:bg-brand-600"
              onClick={handleUpgradeClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Assinar PRO
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SidePanel;
