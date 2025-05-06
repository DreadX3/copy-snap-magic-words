
import { Card, CardContent } from "@/components/ui/card";
import { CopyResult } from "@/components/copy/types";
import FavoriteButton from "@/components/copy/FavoriteButton";
import CopyButton from "@/components/copy/CopyButton";
import ShareSection from "@/components/copy/ShareSection";

interface CopyResultsProps {
  results: CopyResult[];
  onSelectResult?: (result: CopyResult) => void;
  selectedResult?: CopyResult | null;
  historyMode?: boolean;
  imageUrl?: string | null;
}

const CopyResults = ({ 
  results, 
  onSelectResult, 
  selectedResult, 
  historyMode = false,
  imageUrl = null
}: CopyResultsProps) => {
  if (results.length === 0) return null;
  
  const textToShare = selectedResult ? selectedResult.text : results[0].text;
  const selectedImageUrl = imageUrl || (historyMode ? null : null);
  
  return (
    <div className="space-y-6">
      {!historyMode && <h3 className="text-xl font-bold mb-4">Escolha sua copywriting</h3>}
      
      {results.map((result) => (
        <Card 
          key={result.id}
          className={`overflow-hidden transition-all ${!historyMode && "cursor-pointer"} ${
            selectedResult?.id === result.id && !historyMode
              ? "border-brand-500 ring-2 ring-brand-200"
              : "hover:border-gray-300"
          }`}
          onClick={() => onSelectResult && onSelectResult(result)}
        >
          <CardContent className="p-4 relative">
            {selectedResult?.id === result.id && !historyMode && (
              <div className="absolute -right-1 -top-1 bg-brand-500 text-white p-1 rounded-bl-md">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.text}</p>
            
            <div className="mt-4 flex justify-between items-center">
              <FavoriteButton result={result} size="sm" />
              
              {historyMode && (
                <CopyButton text={result.text} size="sm" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Sharing section */}
      {!historyMode && <ShareSection text={textToShare} imageUrl={selectedImageUrl} />}
      
      {/* Sharing section for history mode */}
      {historyMode && <ShareSection text={results[0].text} imageUrl={selectedImageUrl} />}
    </div>
  );
};

export default CopyResults;
