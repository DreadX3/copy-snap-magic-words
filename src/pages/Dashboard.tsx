
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import CopyGenerator, { GenerateOptions } from "@/components/CopyGenerator";
import CopyResults, { CopyResult } from "@/components/CopyResults";
import UsageStats from "@/components/UsageStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, History, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState<CopyResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CopyResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
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
      
      // Update user quota if not PRO
      if (user && !user.isPro) {
        const updatedUser = {
          ...user,
          usedToday: (user.usedToday || 0) + 1,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      setCopyResults(results);
      setSelectedResult(results[0]);
      setIsGenerating(false);
      
      toast({
        title: "Copywriting gerado!",
        description: "Escolha a melhor opção para o seu produto.",
      });
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        imageUrl,
        results,
        date: new Date().toISOString(),
      };
      const history = JSON.parse(localStorage.getItem("history") || "[]");
      history.unshift(newHistoryItem);
      localStorage.setItem("history", JSON.stringify(history.slice(0, 10))); // Keep only last 10
      setHistoryItems(history);
      
    }, 2000);
  };
  
  // Load history on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    setHistoryItems(history);
  }, []);
  
  const renderDashboardContent = () => {
    if (showHistory) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Histórico</h1>
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
            >
              Nova geração
            </Button>
          </div>
          
          {historyItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma geração encontrada</h3>
              <p className="mt-1 text-gray-500">Faça sua primeira geração para começar o histórico.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowHistory(false)}
              >
                Nova geração
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {historyItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <img 
                        src={item.imageUrl} 
                        alt="Produto" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4 md:col-span-2">
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(item.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="space-y-2">
                        {item.results.map((result: CopyResult) => (
                          <div key={result.id} className="border p-2 rounded-md text-sm">
                            {result.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }
    
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
              <div>
                <CopyResults 
                  results={copyResults}
                  onSelectResult={setSelectedResult}
                  selectedResult={selectedResult}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <UsageStats />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Histórico</CardTitle>
              <CardDescription>
                Acesse suas gerações anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowHistory(true)}
                variant="outline" 
                className="w-full"
              >
                <History className="mr-2 h-4 w-4" />
                Ver histórico
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-50 border-brand-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Plano PRO</CardTitle>
              <CardDescription>
                Desbloqueie recursos avançados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gerações ilimitadas</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Histórico completo</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-brand-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Recursos exclusivos</span>
                </li>
              </ul>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Assinar PRO
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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
