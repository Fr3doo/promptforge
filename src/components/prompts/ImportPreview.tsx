import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Variable, FileText, Tag, Eye } from "lucide-react";
import { messages } from "@/constants/messages";
import type { ImportResult } from "@/lib/promptImport";

interface ImportPreviewProps {
  data: ImportResult;
  className?: string;
}

/**
 * Preview component showing parsed import data
 * Displays prompt metadata, content preview, and detected variables
 */
export function ImportPreview({ data, className }: ImportPreviewProps) {
  const { prompt, variables, format } = data;
  
  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{messages.import.preview.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {messages.import.preview.format(format)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Titre</span>
            </div>
            <p className="text-foreground font-medium">{prompt.title}</p>
          </div>
          
          {/* Description */}
          {prompt.description && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-foreground line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </>
          )}
          
          {/* Content Preview */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Aperçu du contenu</span>
            </div>
            <ScrollArea className="h-24 w-full rounded-md border bg-muted/30 p-3">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {prompt.content.slice(0, 500)}
                {prompt.content.length > 500 && "..."}
              </pre>
            </ScrollArea>
          </div>
          
          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Variables */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Variable className="h-4 w-4" />
              <span>
                {variables.length > 0 
                  ? messages.import.preview.variables(variables.length)
                  : messages.import.preview.noVariables
                }
              </span>
            </div>
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {variables.map((variable, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono">
                    {`{{${variable.name}}}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
