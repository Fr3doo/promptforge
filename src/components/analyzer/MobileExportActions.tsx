import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";

interface MobileExportActionsProps {
  jsonData: any;
  markdownData: string;
  filename: string;
}

export function MobileExportActions({ jsonData, markdownData, filename }: MobileExportActionsProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    successToast(messages.success.copied, messages.copy.export(label));
  };

  const downloadFile = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    successToast("Fichier téléchargé", messages.success.downloaded(name));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">JSON</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(jsonData, null, 2), "JSON")}
            className="w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier le JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(
              JSON.stringify(jsonData, null, 2),
              `${filename}.json`,
              'application/json'
            )}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Markdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => copyToClipboard(markdownData, "Markdown")}
            className="w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier le Markdown
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(markdownData, `${filename}.md`, 'text/markdown')}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger Markdown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
