
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Facebook, Instagram, Share2, Twitter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface CopyResult {
  id: number;
  text: string;
}

interface CopyResultsProps {
  results: CopyResult[];
  onSelectResult: (result: CopyResult) => void;
  selectedResult?: CopyResult | null;
  imageUrl?: string; // Add imageUrl prop
}

const CopyResults = ({ results, onSelectResult, selectedResult, imageUrl }: CopyResultsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<number | null>(null);
  
  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
      
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    });
  };
  
  const shareOnSocial = async (text: string, platform: string) => {
    const shareData = {
      title: 'CopySnap AI',
      text: text,
      files: [] as File[]
    };

    // If we have an imageUrl and it's a base64 string, convert it to a file
    if (imageUrl && imageUrl.startsWith('data:')) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
        shareData.files = [file];
      } catch (error) {
        console.error('Error converting image:', error);
      }
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Compartilhado!",
          description: `Texto e imagem compartilhados com sucesso`,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        // Fallback to copying
        copyToClipboard(text, -1);
      }
    } else {
      // Fallback for unsupported browsers
      copyToClipboard(text, -1);
    }
  };
  
  if (results.length === 0) return null;
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">Escolha sua copywriting</h3>
      
      {results.map((result) => (
        <Card 
          key={result.id}
          className={`overflow-hidden transition-all cursor-pointer ${
            selectedResult?.id === result.id
              ? "border-brand-500 ring-2 ring-brand-200"
              : "hover:border-gray-300"
          }`}
          onClick={() => onSelectResult(result)}
        >
          <CardContent className="p-4 relative">
            {selectedResult?.id === result.id && (
              <div className="absolute -right-1 -top-1 bg-brand-500 text-white p-1 rounded-bl-md">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <p className="text-gray-800 whitespace-pre-wrap">{result.text}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(result.text, result.id);
                }}
              >
                {copied === result.id ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copiar
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  shareOnSocial(result.text, 'general');
                }}
              >
                <Share2 className="h-4 w-4 mr-2" /> Compartilhar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="flex items-center text-[#1DA1F2]"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(result.text)}`, '_blank');
                }}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="flex items-center text-[#3b5998]"
                onClick={(e) => {
                  e.stopPropagation();
                  shareOnSocial(result.text, 'facebook');
                }}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="flex items-center text-[#C13584]"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(result.text, result.id);
                  toast({
                    title: "Copiado para Instagram",
                    description: "Texto copiado. Abra o Instagram para colar.",
                  });
                }}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CopyResults;
