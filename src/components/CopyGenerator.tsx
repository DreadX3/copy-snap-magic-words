
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TextLengthOption } from "@/types/generator";

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
  imageDescription: string;
  theme: string;
  textLength: TextLengthOption;
}

const CopyGenerator = ({ imageUrl, onGenerate, isGenerating }: CopyGeneratorProps) => {
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [customHashtags, setCustomHashtags] = useState("");
  const [targetAudience, setTargetAudience] = useState("geral");
  const [imageDescription, setImageDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [textLength, setTextLength] = useState<TextLengthOption>("short");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!imageDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione uma descrição da imagem",
        variant: "destructive",
      });
      return;
    }

    if (!theme.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um tema para o copywriting",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.isPro && user?.usedToday && user?.usedToday >= (user?.dailyQuota || 3)) {
      toast({
        title: "Limite diário atingido",
        description: "Você atingiu seu limite diário de gerações. Atualize para o plano PRO para gerações ilimitadas.",
        variant: "destructive",
      });
      return;
    }

    try {
      onGenerate({
        includeEmojis,
        includeHashtags,
        customHashtags,
        targetAudience,
        imageDescription: imageDescription.trim(),
        theme: theme.trim(),
        textLength
      });
    } catch (error) {
      console.error('Error generating copy:', error);
      toast({
        title: "Erro",
        description: "Houve um erro ao gerar o texto. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm">
            Descrição da imagem
          </Label>
          <Textarea
            id="description"
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            placeholder="Descreva o produto na imagem e seus principais atributos..."
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme" className="text-sm">
            Tema do copywriting
          </Label>
          <Textarea
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Escreva um tema ou contexto específico para o copywriting..."
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Tipo de texto</Label>
          <RadioGroup
            value={textLength}
            onValueChange={(value: TextLengthOption) => setTextLength(value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="short" />
              <Label htmlFor="short">Texto curto e objetivo (máx. 300 caracteres)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long" id="long" />
              <Label htmlFor="long">Texto longo e detalhado (máx. 1000 caracteres)</Label>
            </div>
          </RadioGroup>
        </div>

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
        disabled={!imageUrl || isGenerating}
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
