
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/ImageUploader";
import CopyGenerator, { GenerateOptions } from "@/components/CopyGenerator";
import CopyResults, { CopyResult } from "@/components/CopyResults";
import { useToast } from "@/components/ui/use-toast";

const GeneratorPanel = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState<CopyResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CopyResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImageUrl(previewUrl);
    setCopyResults([]);
    setSelectedResult(null);
  };

  const handleGenerate = async (options: GenerateOptions) => {
    if (!imageUrl) return;
    setIsGenerating(true);
    
    // Mock API call with timeout
    setTimeout(() => {
      // Generate mock results
      const results: CopyResult[] = [
        {
          id: 1,
          text: `✨ Transforme seu visual com nosso tênis ultra confortável! Design moderno e amortecimento que você precisa para seu dia a dia. ${options.includeEmojis ? '👟 🔥' : ''} ${options.includeHashtags ? '#EstiloUrbano #Conforto #MustHave' : ''}`,
        },
        {
          id: 2,
          text: `O tênis perfeito para quem não abre mão de conforto e estilo! Disponível em várias cores para combinar com todos os seus looks. ${options.includeEmojis ? '😍 👌' : ''} ${options.includeHashtags ? '#ModaEsportiva #LookDoDia #Tendência' : ''}`,
        },
        {
          id: 3,
          text: `Qualidade premium e design exclusivo para seus pés! Nosso novo tênis vai levar seu conforto a outro nível. Garanta já o seu! ${options.includeEmojis ? '🛍️ ⚡' : ''} ${options.includeHashtags ? '#CalçadoConfortável #NovaColeção #MelhorPreço' : ''}`,
        },
      ];
      
      setCopyResults(results);
      setSelectedResult(results[0]);
      setIsGenerating(false);
      
      toast({
        title: "Copywriting gerado!",
        description: "Escolha a melhor opção para o seu produto.",
      });
    }, 2000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-6">Nova geração</h1>
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
          </div>
          
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
