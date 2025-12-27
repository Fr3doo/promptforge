import { useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/promptImport";
import { messages } from "@/constants/messages";

interface ImportDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Dropzone component for file upload
 * Supports drag & drop and click to select
 */
export function ImportDropzone({ 
  onFileSelect, 
  isLoading = false,
  className 
}: ImportDropzoneProps) {
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed border-border rounded-lg p-8 text-center",
        "hover:border-primary/50 hover:bg-primary/5 transition-colors",
        "cursor-pointer",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
        aria-label="Sélectionner un fichier"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 rounded-full bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <div>
          <p className="font-medium text-foreground">
            {messages.import.dropzone.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {messages.import.dropzone.subtitle}
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {messages.import.dropzone.acceptedFormats}
        </p>
      </div>
    </div>
  );
}
