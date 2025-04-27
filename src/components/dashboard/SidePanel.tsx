
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UsageStats from "@/components/UsageStats";
import HistoryPanel from "./HistoryPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, PlusCircle } from "lucide-react";

const SidePanel = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-6">
      <UsageStats />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Histórico</CardTitle>
          <CardDescription>
            Acesse suas gerações anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowHistory(true)}
            variant="outline" 
            className="w-full"
          >
            <History className="mr-2 h-4 w-4" />
            Ver histórico
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-brand-50 border-brand-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Plano PRO</CardTitle>
          <CardDescription>
            Desbloqueie recursos avançados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4 text-sm">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Gerações ilimitadas</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Histórico completo</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Recursos exclusivos</span>
            </li>
          </ul>
          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Assinar PRO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidePanel;
