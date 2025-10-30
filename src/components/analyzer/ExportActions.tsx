import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";

interface ExportActionsProps {
  jsonData: any;
  markdownData: string;
  filename: string;
}

export function ExportActions({ jsonData, markdownData, filename }: ExportActionsProps) {
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
    successToast(messages.success.downloaded, messages.copy.download(name));
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h3 className="font-semibold">JSON</h3>
        <div className="w-full overflow-hidden rounded-lg">
          <pre className="p-4 bg-muted text-xs overflow-x-auto max-h-64 max-w-full">
            <code className="block">{JSON.stringify(jsonData, null, 2)}</code>
          </pre>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => copyToClipboard(JSON.stringify(jsonData, null, 2), "JSON")}
          >
            <Copy className="h-3 w-3" />
            Copier
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => downloadFile(
              JSON.stringify(jsonData, null, 2),
              `${filename}.json`,
              'application/json'
            )}
          >
            <Download className="h-3 w-3" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Markdown</h3>
        <div className="w-full overflow-hidden rounded-lg">
          <pre className="p-4 bg-muted text-xs overflow-x-auto max-h-64 max-w-full">
            <code className="block">{markdownData}</code>
          </pre>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => copyToClipboard(markdownData, "Markdown")}
          >
            <Copy className="h-3 w-3" />
            Copier
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => downloadFile(markdownData, `${filename}.md`, 'text/markdown')}
          >
            <Download className="h-3 w-3" />
            Télécharger
          </Button>
        </div>
      </div>
    </div>
  );
}
