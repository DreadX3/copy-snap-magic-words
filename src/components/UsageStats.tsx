
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BadgeCheck, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const UsageStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);
  
  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      setIsChecking(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setSubscriptionData(data);
    } catch (error) {
      console.error("Failed to check subscription:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
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
  
  if (!user) return null;
  
  // Calculate usage percentage
  const dailyQuota = subscriptionData?.dailyQuota || 10;
  const usedToday = user?.usedToday || 0;
  const dailyUsagePercentage = (usedToday / dailyQuota) * 100;
  
  // Calculate monthly usage
  const monthlyQuota = subscriptionData?.monthlyQuota || 50;
  const usedMonth = user?.usedMonth || 0;
  const monthlyUsagePercentage = (usedMonth / monthlyQuota) * 100;
  
  const isPro = subscriptionData?.subscribed || user?.isPro;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Uso diário
          {isPro && (
            <div className="flex items-center gap-1 bg-brand-100 text-brand-800 px-2 py-1 rounded-full text-xs">
              <BadgeCheck className="h-4 w-4" />
              <span>PRO</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {isPro 
            ? "Você tem gerações ilimitadas com seu plano PRO" 
            : `${usedToday} de ${dailyQuota} gerações usadas hoje`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPro && (
          <>
            <Progress value={dailyUsagePercentage} className="h-2" />
            
            <div className="mt-3">
              <CardDescription>
                {`${usedMonth} de ${monthlyQuota} gerações usadas este mês`}
              </CardDescription>
              <Progress value={monthlyUsagePercentage} className="h-2 mt-1" />
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleUpgradeClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Upgrade para PRO"
                )}
              </Button>
            </div>
          </>
        )}
        
        {isPro && (
          <div className="text-center text-sm text-gray-500">
            Aproveite gerações ilimitadas e recursos exclusivos
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageStats;
