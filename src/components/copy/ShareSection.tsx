
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Facebook, Instagram, Share2, Twitter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ShareTarget } from "./types";

interface ShareSectionProps {
  text: string;
}

const ShareSection = ({ text }: ShareSectionProps) => {
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
  
  const shareOnSocial = async (platform: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CopySnap AI',
          text: text,
        });
        toast({
          title: "Compartilhado!",
          description: `Texto compartilhado com sucesso`,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar
      copyToClipboard();
    }
  };
  
  const shareTargets: ShareTarget[] = [
    {
      platform: 'twitter',
      name: 'Twitter',
      color: '#1DA1F2',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank'),
    },
    {
      platform: 'facebook',
      name: 'Facebook',
      color: '#3b5998',
      action: () => shareOnSocial('facebook'),
    },
    {
      platform: 'instagram',
      name: 'Instagram',
      color: '#C13584',
      action: () => {
        copyToClipboard();
        toast({
          title: "Copiado para Instagram",
          description: "Texto copiado. Abra o Instagram para colar.",
        });
      },
    }
  ];
  
  return (
    <Card className="border-dashed border-gray-300">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-3">Compartilhar nas redes sociais</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
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
          
          <Button
            size="sm"
            variant="outline"
            className="flex items-center"
            onClick={() => shareOnSocial('general')}
          >
            <Share2 className="h-4 w-4 mr-2" /> Compartilhar
          </Button>
          
          {shareTargets.map((target) => (
            <Button
              key={target.platform}
              size="sm"
              variant="outline"
              className="flex items-center"
              style={{ color: target.color }}
              onClick={() => target.action(text)}
            >
              {target.platform === 'twitter' && <Twitter className="h-4 w-4 mr-2" />}
              {target.platform === 'facebook' && <Facebook className="h-4 w-4 mr-2" />}
              {target.platform === 'instagram' && <Instagram className="h-4 w-4 mr-2" />}
              {target.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareSection;
