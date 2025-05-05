
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

const UsageStats = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Calculate usage percentage
  const dailyQuota = user.dailyQuota || 3;
  const usedToday = user.usedToday || 0;
  const usagePercentage = (usedToday / dailyQuota) * 100;

  const handleUpgradeToPro = () => {
    window.open("https://buy.stripe.com/test_eVa4jp7RUcM16xa4gg", "_blank");
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
              <Button variant="outline" className="w-full" onClick={handleUpgradeToPro}>
                Upgrade para PRO
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
