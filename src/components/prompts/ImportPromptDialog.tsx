import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, ClipboardPaste, AlertCircle, Loader2 } from "lucide-react";
import { usePromptImport } from "@/hooks/usePromptImport";
import { ImportDropzone } from "./ImportDropzone";
import { ImportPreview } from "./ImportPreview";
import { messages } from "@/constants/messages";
import type { ImportResult, ParseError } from "@/lib/promptImport";

interface ImportPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportMethod = "file" | "paste";

/**
 * Dialog for importing prompts from file or clipboard
 * Supports JSON, Markdown, and plain text formats
 */
export function ImportPromptDialog({ open, onOpenChange }: ImportPromptDialogProps) {
  const { parseContent, parseFile, importPrompt, isImporting, isParsing } = usePromptImport();
  
  const [method, setMethod] = useState<ImportMethod>("file");
  const [pasteContent, setPasteContent] = useState("");
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPasteContent("");
      setParseResult(null);
      setParseError(null);
    }
  }, [open]);
  
  // Parse paste content when it changes (debounced)
  useEffect(() => {
    if (method !== "paste" || !pasteContent.trim()) {
      if (method === "paste") {
        setParseResult(null);
        setParseError(null);
      }
      return;
    }
    
    const timer = setTimeout(() => {
      const result = parseContent(pasteContent);
      if (result.success) {
        setParseResult(result.data);
        setParseError(null);
      } else {
        setParseResult(null);
        setParseError("error" in result ? result.error : null);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pasteContent, method, parseContent]);
  
  const handleFileSelect = useCallback(async (file: File) => {
    const result = await parseFile(file);
    if (result.success) {
      setParseResult(result.data);
      setParseError(null);
    } else {
      setParseResult(null);
      setParseError("error" in result ? result.error : null);
    }
  }, [parseFile]);
  
  const handleImport = useCallback(async () => {
    if (!parseResult) return;
    await importPrompt(parseResult);
    onOpenChange(false);
  }, [parseResult, importPrompt, onOpenChange]);
  
  const handleClear = useCallback(() => {
    setPasteContent("");
    setParseResult(null);
    setParseError(null);
  }, []);
  
  const isLoading = isImporting || isParsing;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{messages.import.title}</DialogTitle>
          <DialogDescription>
            {messages.import.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Method Selection */}
          <Tabs value={method} onValueChange={(v) => setMethod(v as ImportMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                {messages.import.methods.file}
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-2">
                <ClipboardPaste className="h-4 w-4" />
                {messages.import.methods.paste}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="mt-4">
              <ImportDropzone 
                onFileSelect={handleFileSelect} 
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="paste" className="mt-4">
              <Textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={messages.import.paste.placeholder}
                className="min-h-[200px] font-mono text-sm resize-none"
                disabled={isLoading}
              />
            </TabsContent>
          </Tabs>
          
          {/* Error Display */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {parseError.message}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Preview */}
          {parseResult && (
            <ImportPreview data={parseResult} />
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2">
          {(pasteContent || parseResult) && (
            <Button 
              variant="ghost" 
              onClick={handleClear}
              disabled={isLoading}
            >
              {messages.import.actions.clear}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {messages.import.actions.cancel}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!parseResult || isLoading}
            className="gap-2"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            {messages.import.actions.import}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
