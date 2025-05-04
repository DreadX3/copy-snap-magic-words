
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CopyButtonProps {
  text: string;
  size?: "sm" | "default";
}

const CopyButton = ({ text, size = "default" }: CopyButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };
  
  return (
    <Button
      size={size}
      variant="outline"
      className="flex items-center"
      onClick={copyToClipboard}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" /> Copiado
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" /> Copiar
        </>
      )}
    </Button>
  );
};

export default CopyButton;
