
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import CopyResults from "@/components/CopyResults";

interface HistoryItem {
  id: number;
  imageUrl: string;
  results: any[];
  date: string;
}

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onNewGeneration: () => void;
}

const HistoryView = ({ historyItems, onNewGeneration }: HistoryViewProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Histórico</h1>
        <Button variant="outline" onClick={onNewGeneration}>
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
            onClick={onNewGeneration}
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
                    <CopyResults
                      results={item.results}
                      historyMode={true}
                      imageUrl={item.imageUrl}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
