
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkIcon, Copy } from "lucide-react";
import { CopyResult } from "@/components/copy/types";

interface FavoritesViewProps {
  favoriteItems: CopyResult[];
  onNewGeneration: () => void;
}

const FavoritesView = ({ favoriteItems, onNewGeneration }: FavoritesViewProps) => {
  const { toast } = useToast();

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Favoritos</h1>
        <Button
          variant="outline"
          onClick={onNewGeneration}
        >
          Nova geração
        </Button>
      </div>
      
      {favoriteItems.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum favorito encontrado</h3>
          <p className="mt-1 text-gray-500">Favorite textos para encontrá-los rapidamente depois.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={onNewGeneration}
          >
            Nova geração
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {favoriteItems.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <CardContent className="p-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.text}</p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center"
                    onClick={() => handleCopyText(result.text)}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
