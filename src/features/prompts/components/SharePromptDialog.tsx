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
import { messages } from "@/constants/messages";

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
      notifySuccess(messages.success.allPrivateSharesDeleted);
    } catch (error) {
      notifyError(messages.labels.error, messages.errors.share.deleteSomeFailed);
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
              ? messages.dialogs.privateShare.titleNew(promptTitle)
              : messages.dialogs.privateShare.titleExisting(promptTitle)
            }
          </DialogTitle>
          <DialogDescription>
            {shares.length === 0
              ? messages.dialogs.privateShare.descriptionNew
              : messages.dialogs.privateShare.descriptionExisting(shares.length)
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{messages.placeholders.emailInput}</Label>
            <Input
              id="email"
              type="email"
              placeholder={messages.placeholders.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">{messages.permissions.privateAccess}</Label>
            <Select
              value={permission}
              onValueChange={(value: "READ" | "WRITE") => setPermission(value)}
            >
              <SelectTrigger id="permission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="READ">{messages.permissions.readOnly}</SelectItem>
                <SelectItem value="WRITE">{messages.permissions.readAndWrite}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleShare} disabled={isAdding || !email.trim()} className="w-full">
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {messages.buttons.sharePrivate}
          </Button>

          {/* List of existing shares */}
          {loadingShares ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <Label>{messages.sharedWith.label}</Label>
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
                          {messages.sharedWith.sharedOn} {format(new Date(share.created_at), "d MMM yyyy", { locale: fr })}
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
                                  {messages.permissions.readOnly}
                                </div>
                              </SelectItem>
                              <SelectItem value="WRITE">
                                <div className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  {messages.permissions.readAndWrite}
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
              {messages.buttons.stopAllPrivateSharing}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
