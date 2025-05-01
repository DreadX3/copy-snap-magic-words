
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GeneratorPanel from "@/components/dashboard/GeneratorPanel";
import HistoryPanel from "@/components/dashboard/HistoryPanel";

const Dashboard = () => {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <DashboardLayout>
      {showHistory ? (
        <HistoryPanel onClose={() => setShowHistory(false)} />
      ) : (
        <GeneratorPanel />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
