import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { usePromptShares, useAddPromptShare, useDeletePromptShare } from "@/hooks/usePromptShares";

interface SharePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptTitle: string;
}

export const SharePromptDialog = ({
  open,
  onOpenChange,
  promptId,
  promptTitle,
}: SharePromptDialogProps) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"READ" | "WRITE">("READ");

  // Use hooks from the repository layer
  const { data: shares = [], isLoading: loadingShares, refetch } = usePromptShares(open ? promptId : undefined);
  const { mutate: addShare, isPending: isAdding } = useAddPromptShare(promptId);
  const { mutate: deleteShare } = useDeletePromptShare(promptId);

  // Refetch shares when dialog opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const handleShare = () => {
    if (!email.trim()) {
      return;
    }

    addShare(
      { email, permission },
      {
        onSuccess: () => {
          setEmail("");
          setPermission("READ");
        },
      }
    );
  };

  const handleDeleteShare = (shareId: string) => {
    deleteShare(shareId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Partage Privé : "{promptTitle}"</DialogTitle>
          <DialogDescription>
            Partagez ce prompt avec des utilisateurs spécifiques en lecture seule ou avec
            droits de modification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email de l'utilisateur</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">Niveau d'accès</Label>
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
          </div>

          <Button onClick={handleShare} disabled={isAdding || !email.trim()} className="w-full">
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Partager
          </Button>

          {/* List of existing shares */}
          {loadingShares ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <Label>Partagé avec</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share) => {
                  const userDisplay = share.shared_with_profile?.name || 
                                     share.shared_with_profile?.email || 
                                     share.shared_with_user_id;
                  
                  return (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {userDisplay}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {share.permission === "READ"
                            ? "Lecture seule"
                            : "Lecture et modification"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShare(share.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
           ) : null}

          {/* Stop all private sharing button */}
          {shares.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => {
                shares.forEach((share) => handleDeleteShare(share.id));
              }}
              className="w-full"
            >
              Arrêter tous les partages privés
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
