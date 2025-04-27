
import { useState, useCallback } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (file: File, previewUrl: string) => void;
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      setIsDragActive(true);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };
  
  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      alert("Por favor, selecione uma imagem.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onImageUpload(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setPreview(null);
  };
  
  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            id="image-upload"
            className="hidden"
          />
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Clique ou arraste uma imagem
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG ou GIF (máximo 5MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-contain"
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
