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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Eye, Edit } from "lucide-react";
import { usePromptShares, useAddPromptShare, useUpdatePromptShare, useDeletePromptShare } from "@/hooks/usePromptShares";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Use hooks from the repository layer
  const { data: shares = [], isLoading: loadingShares, refetch } = usePromptShares(open ? promptId : undefined);
  const { mutate: addShare, isPending: isAdding } = useAddPromptShare(promptId);
  const { mutate: updateShare } = useUpdatePromptShare(promptId);
  const { mutate: deleteShare } = useDeletePromptShare(promptId);
  const { notifySuccess, notifyError } = useToastNotifier();

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

  const handleStopAllSharing = async () => {
    setIsDeletingAll(true);
    try {
      // Créer un tableau de promesses pour toutes les suppressions
      await Promise.all(
        shares.map(share => 
          new Promise<void>((resolve, reject) => {
            deleteShare(share.id, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            });
          })
        )
      );
      notifySuccess("Tous les partages privés ont été supprimés");
    } catch (error) {
      notifyError("Erreur", "Certains partages n'ont pas pu être supprimés");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shares.length === 0 
              ? `Partage Privé : "${promptTitle}"`
              : `Gérer le partage privé de "${promptTitle}"`
            }
          </DialogTitle>
          <DialogDescription>
            {shares.length === 0
              ? "Partagez ce prompt avec des utilisateurs spécifiques en lecture seule ou avec droits de modification"
              : `${shares.length} utilisateur${shares.length > 1 ? 's ont' : ' a'} accès à ce prompt`
            }
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
              {shares.map((share) => {
                const profile = share.shared_with_profile;
                const displayName = profile?.pseudo || profile?.email || "Utilisateur inconnu";
                const hasSecondaryInfo = profile?.pseudo && profile?.email;
                
                return (
                  <Card key={share.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {displayName}
                        </p>
                        {hasSecondaryInfo && (
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Partagé le {format(new Date(share.created_at), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            value={share.permission}
                            onValueChange={(newPermission: "READ" | "WRITE") => {
                              updateShare({ 
                                shareId: share.id, 
                                permission: newPermission 
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="READ">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Lecture seule
                                </div>
                              </SelectItem>
                              <SelectItem value="WRITE">
                                <div className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Lecture et modification
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteShare(share.id)}
                            aria-label="Supprimer le partage"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
           ) : null}

          {/* Stop all private sharing button */}
          {shares.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleStopAllSharing}
              disabled={isDeletingAll}
              className="w-full"
            >
              {isDeletingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Arrêter tous les partages privés
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
