
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenerationDashboard from "@/components/dashboard/GenerationDashboard";
import HistoryView from "@/components/dashboard/HistoryView";
import FavoritesView from "@/components/dashboard/FavoritesView";

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");
  
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Load history on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    setHistoryItems(history);
  }, []);
  
  const handleBackToGeneration = () => {
    setSearchParams({});
  };
  
  const renderDashboardContent = () => {
    if (view === "history") {
      return (
        <HistoryView 
          historyItems={historyItems}
          onNewGeneration={handleBackToGeneration}
        />
      );
    }
    
    if (view === "favorites") {
      return (
        <FavoritesView 
          onNewGeneration={handleBackToGeneration}
        />
      );
    }
    
    return (
      <GenerationDashboard onHistoryUpdate={setHistoryItems} />
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {renderDashboardContent()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
