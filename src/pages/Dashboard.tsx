
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GeneratorPanel from "@/components/dashboard/GeneratorPanel";
import HistoryPanel from "@/components/dashboard/HistoryPanel";
import { Button } from "@/components/ui/button";
import { History, PlusCircle } from "lucide-react";
import UsageStats from "@/components/UsageStats"; // Add the missing import

const Dashboard = () => {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {showHistory ? "Histórico de gerações" : "Nova geração"}
        </h1>
        <Button 
          variant="outline" 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          {showHistory ? (
            <>
              <PlusCircle className="h-4 w-4" />
              Nova geração
            </>
          ) : (
            <>
              <History className="h-4 w-4" />
              Ver histórico
            </>
          )}
        </Button>
      </div>
      
      {showHistory ? (
        <HistoryPanel onClose={() => setShowHistory(false)} />
      ) : (
        <GeneratorPanel />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
