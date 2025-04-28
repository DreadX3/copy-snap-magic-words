
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { CopyResult } from "@/components/CopyResults";
import { useAuth } from "@/context/AuthContext";

interface HistoryItem {
  id: number;
  imageUrl: string;
  results: CopyResult[];
  date: string;
}

const HistoryPanel = ({ onClose }: { onClose: () => void }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const { user } = useAuth();
  const historyLimit = user?.isPro ? 50 : 10;

  useEffect(() => {
    // Load history from localStorage
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    // Apply limit based on user plan
    const limitedHistory = history.slice(0, historyLimit);
    setHistoryItems(limitedHistory);
  }, [historyLimit]);

  return (
    <div className="space-y-8">      
      {historyItems.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma geração encontrada</h3>
          <p className="mt-1 text-gray-500">Faça sua primeira geração para começar o histórico.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={onClose}
          >
            Nova geração
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Mostrando {historyItems.length} {historyItems.length === 1 ? 'item' : 'itens'} do histórico
              {!user?.isPro && historyItems.length === historyLimit && (
                <span className="ml-1">
                  (limite do plano FREE - faça upgrade para ver mais)
                </span>
              )}
            </p>
          </div>
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
                      {item.results.map((result) => (
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
        </>
      )}
    </div>
  );
};

export default HistoryPanel;
