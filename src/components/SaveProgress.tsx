import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SaveProgressProps {
  isSaving: boolean;
  onComplete?: () => void;
}

export function SaveProgress({ isSaving, onComplete }: SaveProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setProgress(0);
      setShowSuccess(false);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (progress > 0) {
      setProgress(100);
      setTimeout(() => {
        setShowSuccess(true);
        onComplete?.();
      }, 200);
      setTimeout(() => {
        setProgress(0);
        setShowSuccess(false);
      }, 2000);
    }
  }, [isSaving, progress, onComplete]);

  if (progress === 0 && !showSuccess) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg w-80 z-50">
      {showSuccess ? (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Enregistré avec succès !</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Enregistrement en cours...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
