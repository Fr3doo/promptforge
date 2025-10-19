import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ReactDiffViewer from "react-diff-viewer-continued";

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  oldContent: string;
  newContent: string;
  oldVersion: string;
  newVersion: string;
}

export function DiffViewer({
  isOpen,
  onClose,
  oldContent,
  newContent,
  oldVersion,
  newVersion,
}: DiffViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Comparaison de versions</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              v{oldVersion}
            </Badge>
            <span>→</span>
            <Badge variant="default" className="font-mono">
              v{newVersion}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto flex-1">
          <ReactDiffViewer
            oldValue={oldContent}
            newValue={newContent}
            splitView={true}
            useDarkTheme={true}
            leftTitle={`Version ${oldVersion}`}
            rightTitle={`Version ${newVersion}`}
            styles={{
              variables: {
                dark: {
                  diffViewerBackground: "hsl(var(--card))",
                  diffViewerColor: "hsl(var(--foreground))",
                  addedBackground: "hsl(120 40% 20%)",
                  addedColor: "hsl(120 60% 85%)",
                  removedBackground: "hsl(0 40% 20%)",
                  removedColor: "hsl(0 60% 85%)",
                  wordAddedBackground: "hsl(120 60% 25%)",
                  wordRemovedBackground: "hsl(0 60% 25%)",
                  addedGutterBackground: "hsl(120 40% 15%)",
                  removedGutterBackground: "hsl(0 40% 15%)",
                  gutterBackground: "hsl(var(--muted))",
                  gutterColor: "hsl(var(--muted-foreground))",
                  highlightBackground: "hsl(var(--accent) / 0.1)",
                  highlightGutterBackground: "hsl(var(--accent) / 0.2)",
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
