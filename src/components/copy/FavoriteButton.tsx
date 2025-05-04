
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteButtonProps {
  id: number;
  size?: "sm" | "default";
}

const FavoriteButton = ({ id, size = "default" }: FavoriteButtonProps) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if item is already favorited on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("copyFavorites");
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    setIsFavorite(favorites.includes(id));
  }, [id]);
  
  const toggleFavorite = () => {
    const storedFavorites = localStorage.getItem("copyFavorites");
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((favId: number) => favId !== id);
      localStorage.setItem("copyFavorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      
      toast({
        title: "Removido dos favoritos",
        description: "Texto removido da sua lista de favoritos",
      });
    } else {
      // Add to favorites
      const newFavorites = [...favorites, id];
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
      {isFavorite ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" /> Favoritado
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
