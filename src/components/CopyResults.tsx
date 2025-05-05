
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyResult } from "@/components/copy/types";
import { Checkbox } from "@/components/ui/checkbox";
import FavoriteButton from "@/components/copy/FavoriteButton";
import CopyButton from "@/components/copy/CopyButton";
import ShareSection from "@/components/copy/ShareSection";

interface CopyResultsProps {
  results: CopyResult[];
  onSelectResult?: (result: CopyResult) => void;
  selectedResult?: CopyResult | null;
  historyMode?: boolean;
}

const CopyResults = ({ results, onSelectResult, selectedResult, historyMode = false }: CopyResultsProps) => {
  const [checkedItems, setCheckedItems] = useState<{[key: number]: boolean}>({});
  const [textToShare, setTextToShare] = useState<string>(selectedResult ? selectedResult.text : results[0]?.text || "");
  
  if (results.length === 0) return null;
  
  const handleCheckboxChange = (id: number, text: string) => {
    const newCheckedItems = { ...checkedItems };
    
    // Toggle the checkbox
    if (newCheckedItems[id]) {
      delete newCheckedItems[id];
      
      // If this was the last selected item, use the selected result or first result text
      if (Object.keys(newCheckedItems).length === 0) {
        setTextToShare(selectedResult ? selectedResult.text : results[0].text);
      }
    } else {
      newCheckedItems[id] = true;
      // Update the text to share with the checked item's text
      setTextToShare(text);
    }
    
    setCheckedItems(newCheckedItems);
  };
  
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
        >
          <CardContent className="p-4 relative">
            <div className="flex items-start">
              <Checkbox
                id={`checkbox-${result.id}`}
                className="mr-3 mt-1"
                checked={!!checkedItems[result.id]}
                onCheckedChange={() => handleCheckboxChange(result.id, result.text)}
              />
              
              <div className="w-full" onClick={() => onSelectResult && onSelectResult(result)}>
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Sharing section */}
      {!historyMode && <ShareSection text={Object.keys(checkedItems).length > 0 ? textToShare : (selectedResult ? selectedResult.text : results[0].text)} />}
      
      {/* Sharing section for history mode */}
      {historyMode && <ShareSection text={Object.keys(checkedItems).length > 0 ? textToShare : results[0].text} />}
    </div>
  );
};

export default CopyResults;
