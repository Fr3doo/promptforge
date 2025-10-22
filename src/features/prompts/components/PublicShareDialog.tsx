import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PublicShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptTitle: string;
  currentVisibility: "PRIVATE" | "SHARED";
  currentPermission: "READ" | "WRITE";
  onConfirm: (permission?: "READ" | "WRITE") => Promise<void>;
}

export const PublicShareDialog = ({
  open,
  onOpenChange,
  promptTitle,
  currentVisibility,
  currentPermission,
  onConfirm,
}: PublicShareDialogProps) => {
  const [permission, setPermission] = useState<"READ" | "WRITE">(currentPermission);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(permission);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentVisibility === "PRIVATE" 
              ? `Partager publiquement "${promptTitle}"` 
              : `Modifier le partage public de "${promptTitle}"`}
          </DialogTitle>
          <DialogDescription>
            {currentVisibility === "PRIVATE"
              ? "Choisissez le niveau d'accès pour les utilisateurs qui verront ce prompt"
              : "Modifier le niveau d'accès public ou rendre le prompt privé"}
          </DialogDescription>
        </DialogHeader>

        {currentVisibility === "SHARED" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permission">Niveau d'accès public</Label>
              <Select
                value={permission}
                onValueChange={(value: "READ" | "WRITE") => setPermission(value)}
              >
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Lecture seule</SelectItem>
                  <SelectItem value="WRITE">Lecture et modification</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {permission === "READ"
                  ? "Tous les utilisateurs pourront voir ce prompt mais ne pourront pas le modifier"
                  : "Tous les utilisateurs pourront voir et modifier ce prompt"}
              </p>
            </div>
          </div>
        )}

        {currentVisibility === "PRIVATE" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permission">Niveau d'accès public</Label>
              <Select
                value={permission}
                onValueChange={(value: "READ" | "WRITE") => setPermission(value)}
              >
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Lecture seule</SelectItem>
                  <SelectItem value="WRITE">Lecture et modification</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {permission === "READ"
                  ? "Tous les utilisateurs pourront voir ce prompt mais ne pourront pas le modifier"
                  : "Tous les utilisateurs pourront voir et modifier ce prompt"}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          {currentVisibility === "SHARED" && (
            <Button 
              variant="destructive" 
              onClick={async () => {
                setIsLoading(true);
                try {
                  await onConfirm(); // Ne pas passer de permission pour forcer le toggle vers PRIVATE
                  onOpenChange(false);
                } finally {
                  setIsLoading(false);
                }
              }} 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rendre privé
            </Button>
          )}
          {currentVisibility === "PRIVATE" && (
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Partager publiquement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
