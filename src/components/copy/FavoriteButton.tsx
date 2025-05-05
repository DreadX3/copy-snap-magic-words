
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CopyResult } from "@/components/copy/types";

interface FavoriteButtonProps {
  result: CopyResult;
  size?: "sm" | "default";
  showRemoveOnly?: boolean;
}

const FavoriteButton = ({ result, size = "default", showRemoveOnly = false }: FavoriteButtonProps) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if item is already favorited on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("copyFavorites");
    const favorites: CopyResult[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    setIsFavorite(favorites.some(fav => fav.id === result.id));
  }, [result.id]);
  
  const toggleFavorite = () => {
    const storedFavorites = localStorage.getItem("copyFavorites");
    const favorites: CopyResult[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((fav) => fav.id !== result.id);
      localStorage.setItem("copyFavorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      
      toast({
        title: "Removido dos favoritos",
        description: "Texto removido da sua lista de favoritos",
      });
    } else {
      // Add to favorites
      const newFavorites = [...favorites, result];
      localStorage.setItem("copyFavorites", JSON.stringify(newFavorites));
      setIsFavorite(true);
      
      toast({
        title: "Adicionado aos favoritos",
        description: "Texto adicionado à sua lista de favoritos",
      });
    }
  };
  
  return (
    <Button
      size={size}
      variant="ghost"
      className="flex items-center text-gray-600 hover:text-brand-500"
      onClick={toggleFavorite}
    >
      {isFavorite || showRemoveOnly ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" /> {showRemoveOnly ? "Remover" : "Favoritado"}
        </>
      ) : (
        <>
          <BookmarkPlus className="h-4 w-4 mr-2" /> Favoritar
        </>
      )}
    </Button>
  );
};

export default FavoriteButton;
