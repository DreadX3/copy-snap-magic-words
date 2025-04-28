
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PlanInfo = () => {
  const { user, upgradeToPro } = useAuth();
  
  if (!user) return null;
  
  const planFeatures = {
    free: [
      "3 gerações por dia",
      "Histórico das últimas 10 mensagens",
      "Acesso a todos os temas"
    ],
    pro: [
      "Gerações ilimitadas",
      "Histórico das últimas 50 mensagens", 
      "Acesso prioritário", 
      "Suporte premium"
    ]
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user.isPro ? (
            <>Plano PRO</>
          ) : (
            <>Plano FREE</>
          )}
        </CardTitle>
        <CardDescription>
          {user.isPro 
            ? "Você está usando todos os recursos premium"
            : "Atualize para o plano PRO para mais recursos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(user.isPro ? planFeatures.pro : planFeatures.free).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
          
          {!user.isPro && (
            <div className="mt-6">
              <Button 
                onClick={upgradeToPro} 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Upgrade para PRO
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanInfo;
