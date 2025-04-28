
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/ImageUploader";
import CopyGenerator, { GenerateOptions } from "@/components/CopyGenerator";
import CopyResults, { CopyResult } from "@/components/CopyResults";
import { useToast } from "@/components/ui/use-toast";
import SidePanel from "@/components/dashboard/SidePanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const GeneratorPanel = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState<CopyResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CopyResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleImageUpload = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImageUrl(previewUrl);
    setCopyResults([]);
    setSelectedResult(null);
  };

  const handleGenerate = async (options: GenerateOptions) => {
    if (!imageUrl || !user) return;
    
    // Check if free user has reached daily limit
    if (!user.isPro && user.usedToday >= user.dailyQuota) {
      toast({
        title: "Limite diário atingido",
        description: "Você atingiu o limite de gerações do plano FREE. Faça upgrade para o plano PRO para gerações ilimitadas.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: { 
          imageUrl, 
          includeEmojis: options.includeEmojis,
          customHashtags: options.customHashtags,
          targetAudience: options.targetAudience,
          imageDescription: options.imageDescription,
          theme: options.theme,
          textLength: options.textLength
        }
      });
      
      if (error) throw error;
      
      if (data && data.copies && Array.isArray(data.copies)) {
        const results: CopyResult[] = data.copies.map((text: string, index: number) => ({
          id: index + 1,
          text,
        }));
        
        setCopyResults(results);
        setSelectedResult(results[0]);
        
        // Update user's daily usage counter
        if (!user.isPro) {
          const updatedUser = {
            ...user,
            usedToday: user.usedToday + 1
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // In a real app, this would update the database
        }
        
        // Save to history
        const historyItem = {
          id: Date.now(),
          imageUrl,
          results,
          date: new Date().toISOString(),
        };
        
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        const updatedHistory = [historyItem, ...history];
        localStorage.setItem("history", JSON.stringify(updatedHistory));
        
        toast({
          title: "Copywriting gerado!",
          description: "Escolha a melhor opção para o seu produto.",
        });
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Erro ao gerar copywriting:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o copywriting. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Imagem do produto</CardTitle>
              <CardDescription>
                Faça upload de uma imagem do seu produto para gerar textos de copywriting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageUpload={handleImageUpload} />
            </CardContent>
          </Card>
          
          {imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Opções de geração</CardTitle>
                <CardDescription>
                  Personalize como sua copywriting será gerada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CopyGenerator 
                  imageUrl={imageUrl}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </CardContent>
            </Card>
          )}
          
          {copyResults.length > 0 && (
            <CopyResults 
              results={copyResults}
              onSelectResult={setSelectedResult}
              selectedResult={selectedResult}
            />
          )}
        </div>
      </div>
      <SidePanel />
    </div>
  );
};

export default GeneratorPanel;
