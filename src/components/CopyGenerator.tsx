
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

interface CopyGeneratorProps {
  imageUrl: string | null;
  onGenerate: (options: GenerateOptions) => void;
  isGenerating: boolean;
}

export interface GenerateOptions {
  includeEmojis: boolean;
  includeHashtags: boolean;
  customHashtags: string;
  targetAudience: string;
}

const CopyGenerator = ({ imageUrl, onGenerate, isGenerating }: CopyGeneratorProps) => {
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [customHashtags, setCustomHashtags] = useState("");
  const [targetAudience, setTargetAudience] = useState("geral");
  const { user } = useAuth();
  const { toast } = useToast();
  const [usageError, setUsageError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkUsageLimits();
    }
  }, [user]);
  
  const checkUsageLimits = async () => {
    try {
      setIsChecking(true);
      setUsageError(null);
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setSubscriptionData(data);
      
      // Check if user has reached daily limit
      if (!data.subscribed && user?.usedToday >= data.dailyQuota) {
        setUsageError(`Você atingiu seu limite diário de ${data.dailyQuota} gerações. Atualize para o plano PRO para gerações ilimitadas.`);
      }
      
      // Check if user has reached monthly limit
      if (!data.subscribed && user?.usedMonth >= data.monthlyQuota) {
        setUsageError(`Você atingiu seu limite mensal de ${data.monthlyQuota} gerações. Atualize para o plano PRO para gerações ilimitadas.`);
      }
    } catch (error) {
      console.error("Failed to check usage limits:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleUpgradeClick = async () => {
    try {
      setIsUpgrading(true);
      
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
    } finally {
      setIsUpgrading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }
    
    // If there's a usage error, show toast and return
    if (usageError) {
      toast({
        title: "Limite atingido",
        description: usageError,
        variant: "destructive",
      });
      return;
    }
    
    onGenerate({
      includeEmojis,
      includeHashtags,
      customHashtags,
      targetAudience,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {usageError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limite atingido</AlertTitle>
          <AlertDescription>
            {usageError}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpgradeClick}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Upgrade para PRO"
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emojis"
            checked={includeEmojis}
            onCheckedChange={(checked) => setIncludeEmojis(checked === true)}
          />
          <label
            htmlFor="emojis"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Incluir emojis
          </label>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hashtags"
              checked={includeHashtags}
              onCheckedChange={(checked) => setIncludeHashtags(checked === true)}
            />
            <label
              htmlFor="hashtags"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir hashtags
            </label>
          </div>
          
          {includeHashtags && (
            <div className="pl-6">
              <Label htmlFor="custom-hashtags" className="text-sm">
                Hashtags personalizadas (opcional, separadas por espaço)
              </Label>
              <Input
                id="custom-hashtags"
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
                placeholder="Ex: moda verão tendência"
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="audience" className="text-sm">
            Público-alvo
          </Label>
          <Select
            value={targetAudience}
            onValueChange={setTargetAudience}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o público-alvo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Geral</SelectItem>
              <SelectItem value="jovem">Jovem (18-25 anos)</SelectItem>
              <SelectItem value="adulto">Adulto (26-40 anos)</SelectItem>
              <SelectItem value="maduro">Maduro (41+ anos)</SelectItem>
              <SelectItem value="luxo">Consumidor de luxo</SelectItem>
              <SelectItem value="promocao">Caçador de promoções</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={!imageUrl || isGenerating || !!usageError}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
          </>
        ) : (
          "Gerar copywriting"
        )}
      </Button>
    </form>
  );
};

export default CopyGenerator;
