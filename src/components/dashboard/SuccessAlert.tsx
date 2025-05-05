
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

const SuccessAlert = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState<{ title: string; description: string; variant: 'success' | 'warning' } | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setMessage({
        title: "Pagamento bem sucedido!",
        description: "Seu plano PRO foi ativado. Atualizando suas informações...",
        variant: 'success'
      });
      setShowAlert(true);
      
      // Check subscription status
      checkSubscription();
      
      // Hide alert after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    if (canceled === 'true') {
      setMessage({
        title: "Pagamento cancelado",
        description: "O processo de pagamento foi cancelado. Tente novamente quando estiver pronto.",
        variant: 'warning'
      });
      setShowAlert(true);
      
      // Hide alert after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, checkSubscription]);

  if (!showAlert || !message) return null;

  return (
    <Alert variant={message.variant === 'success' ? 'default' : 'destructive'} className="mb-4">
      {message.variant === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription>
        {message.description}
      </AlertDescription>
    </Alert>
  );
};

export default SuccessAlert;
