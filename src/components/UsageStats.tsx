
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const UsageStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;
  
  // Calculate usage percentage
  const dailyQuota = user.dailyQuota || 3;
  const usedToday = user.usedToday || 0;
  const usagePercentage = (usedToday / dailyQuota) * 100;

  const handleUpgradeToPro = async () => {
    try {
      setIsLoading(true);
      
      // Call the Stripe checkout session creation function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Falha ao criar a sessão de checkout");
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Uso diário
          {user.isPro && (
            <div className="flex items-center gap-1 bg-brand-100 text-brand-800 px-2 py-1 rounded-full text-xs">
              <BadgeCheck className="h-4 w-4" />
              <span>PRO</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {user.isPro 
            ? "Você tem gerações ilimitadas com seu plano PRO" 
            : `${usedToday} de ${dailyQuota} gerações usadas hoje`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!user.isPro && (
          <>
            <Progress value={usagePercentage} className="h-2" />
            
            <div className="mt-4">
              <Button 
                variant="pro" 
                className="w-full" 
                onClick={handleUpgradeToPro}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Upgrade para PRO"
                )}
              </Button>
            </div>
          </>
        )}
        
        {user.isPro && (
          <div className="text-center text-sm text-gray-500">
            Aproveite gerações ilimitadas e recursos exclusivos
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageStats;
