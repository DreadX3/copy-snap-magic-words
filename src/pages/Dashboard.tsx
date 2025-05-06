
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenerationDashboard from "@/components/dashboard/GenerationDashboard";
import HistoryView from "@/components/dashboard/HistoryView";
import FavoritesView from "@/components/dashboard/FavoritesView";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");
  const checkoutStatus = searchParams.get("checkout");
  
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const { toast } = useToast();
  
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
  
  // Handle checkout status
  useEffect(() => {
    if (checkoutStatus) {
      if (checkoutStatus === "success") {
        toast({
          title: "Assinatura realizada com sucesso!",
          description: "Seu plano PRO foi ativado.",
          variant: "default",
        });
      } else if (checkoutStatus === "cancel") {
        toast({
          title: "Assinatura cancelada",
          description: "Você cancelou o processo de assinatura.",
          variant: "default",
        });
      }
      
      // Remove checkout param after showing toast
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("checkout");
      setSearchParams(newParams);
      
      // Check subscription status after checkout
      checkSubscription();
    }
  }, [checkoutStatus, searchParams, setSearchParams, toast]);
  
  // Check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);
  
  const checkSubscription = async () => {
    try {
      await supabase.functions.invoke("check-subscription");
    } catch (error) {
      console.error("Failed to check subscription:", error);
    }
  };
  
  const handleBackToGeneration = () => {
    setSearchParams({});
  };
  
  const handleHistoryUpdate = (updatedItems: any[]) => {
    setHistoryItems(updatedItems);
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
      <>
        {checkoutStatus === "success" && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertTitle>Assinatura realizada com sucesso!</AlertTitle>
            <AlertDescription>
              Seu plano PRO foi ativado. Agora você tem gerações ilimitadas e recursos exclusivos.
            </AlertDescription>
          </Alert>
        )}
        
        {checkoutStatus === "cancel" && (
          <Alert className="mb-6 bg-gray-50 text-gray-800 border-gray-200">
            <XCircle className="h-5 w-5 text-gray-500" />
            <AlertTitle>Assinatura cancelada</AlertTitle>
            <AlertDescription>
              Você cancelou o processo de assinatura. Você pode assinar o plano PRO a qualquer momento.
            </AlertDescription>
          </Alert>
        )}
        
        <GenerationDashboard onHistoryUpdate={handleHistoryUpdate} />
      </>
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
