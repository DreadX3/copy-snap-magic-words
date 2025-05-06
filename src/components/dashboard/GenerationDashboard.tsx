import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Loader2 } from "lucide-react";
import CopyGenerator, { GenerateOptions } from "@/components/CopyGenerator";
import CopyResults from "@/components/CopyResults";
import { CopyResult } from "@/components/copy/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabase";

const GenerationDashboard = ({ onHistoryUpdate }: { onHistoryUpdate: (history: any[]) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<CopyResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CopyResult | null>(null);
  
  // Calculate usage percentage
  const usedMonth = user?.usedMonth || 0;
  
  // Calculate monthly usage
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const resetDailyUsage = user?.lastUsageDay !== today;
  
  const resetMonthlyUsage = user?.lastUsageMonth !== currentMonth || 
                           user?.lastUsageYear !== currentYear;
  
  useEffect(() => {
    if (resetDailyUsage) {
      resetDailyQuota();
    }
    
    if (resetMonthlyUsage) {
      resetMonthlyQuota();
    }
  }, [resetDailyUsage, resetMonthlyUsage]);
  
  const resetDailyQuota = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ used_today: 0, last_usage_day: today })
        .eq("id", user?.id);
        
      if (error) {
        throw error;
      }
      
      // Update user context
      if (user) {
        const updatedUser = { ...user, usedToday: 0, lastUsageDay: today };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error resetting daily quota:", error);
    }
  };
  
  const resetMonthlyQuota = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          used_month: 0, 
          last_usage_month: currentMonth,
          last_usage_year: currentYear
        })
        .eq("id", user?.id);
        
      if (error) {
        throw error;
      }
      
      // Update user context
      if (user) {
        const updatedUser = { 
          ...user, 
          usedMonth: 0, 
          lastUsageMonth: currentMonth,
          lastUsageYear: currentYear
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error resetting monthly quota:", error);
    }
  };
  
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: storageError } = await supabase.storage
        .from("images")
        .upload(filePath, file);
        
      if (storageError) {
        throw storageError;
      }
      
      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      
      if (data && data.publicUrl) {
        setImageUrl(data.publicUrl);
      } else {
        throw new Error("Failed to retrieve public URL for the image.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload da imagem";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };
  
  const generateCopy = async (options: GenerateOptions) => {
    if (!imageUrl) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      setResults([]);
      setSelectedResult(null);
      
      const { data, error } = await supabase.functions.invoke("generate-copywriting", {
        body: {
          imageUrl: imageUrl,
          includeEmojis: options.includeEmojis,
          includeHashtags: options.includeHashtags,
          customHashtags: options.customHashtags,
          targetAudience: options.targetAudience,
        },
      });
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        const newResults = data.map((text) => ({ id: uuidv4(), text, favorite: false }));
        setResults(newResults);
        
        // Update history in local storage
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        const newHistory = [...history, { imageUrl, results: newResults }];
        localStorage.setItem("history", JSON.stringify(newHistory));
        
        // Notify parent component about history update
        onHistoryUpdate(newHistory);
        
        // Update used_today count
        await updateUsageCount();
      } else {
        throw new Error("Resposta inválida da função de geração de texto");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar a copy";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      console.error("Error generating copywriting:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const updateUsageCount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("increment-usage");
      
      if (error) throw error;
      
      if (data && data.used_today !== undefined) {
        // Update user context
        if (user) {
          const updatedUser = { ...user, usedToday: data.used_today };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error updating usage count:", error);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gerador de Copywriting</CardTitle>
            <CardDescription>
              Faça upload de uma imagem e gere textos criativos para suas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-brand-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Carregando...
                        </span>
                      </>
                    ) : imageUrl ? (
                      <img src={imageUrl} alt="Uploaded" className="max-h-60" />
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 mb-4 text-brand-500 dark:text-gray-400" />
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          Clique para fazer upload
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG ou GIF (MAX. 800x400px)
                        </span>
                      </>
                    )}
                  </div>
                  <Input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={upload}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CopyGenerator 
          imageUrl={imageUrl}
          onGenerate={generateCopy}
          isGenerating={isGenerating}
        />
        
        {results.length > 0 && (
          <CopyResults 
            results={results}
            onSelectResult={setSelectedResult}
            selectedResult={selectedResult}
            imageUrl={imageUrl}
          />
        )}
      </div>
      
      <div className="lg:col-span-1">
        {/* Side Panel */}
      </div>
    </div>
  );
};

export default GenerationDashboard;
