import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type PromptShare = Tables<"prompt_shares"> & {
  shared_with_profile?: {
    email: string | null;
    name: string | null;
  };
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [shares, setShares] = useState<PromptShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const { toast } = useToast();

  const loadShares = async () => {
    setLoadingShares(true);
    try {
      const { data: sharesData, error } = await supabase
        .from("prompt_shares")
        .select("*")
        .eq("prompt_id", promptId);

      if (error) throw error;
      
      // Fetch profiles for each shared user
      if (sharesData && sharesData.length > 0) {
        const userIds = sharesData.map(s => s.shared_with_user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, name")
          .in("id", userIds);

        // Merge profiles with shares
        const sharesWithProfiles = sharesData.map(share => ({
          ...share,
          shared_with_profile: profilesData?.find(p => p.id === share.shared_with_user_id)
        }));
        
        setShares(sharesWithProfiles);
      } else {
        setShares([]);
      }
    } catch (error) {
      console.error("Error loading shares:", error);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir une adresse email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user ID from email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) {
        toast({
          title: "Utilisateur introuvable",
          description: "Aucun utilisateur trouvé avec cet email",
          variant: "destructive",
        });
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create share
      const { error: shareError } = await supabase
        .from("prompt_shares")
        .insert({
          prompt_id: promptId,
          shared_with_user_id: userData.id,
          permission,
          shared_by: user.id,
        });

      if (shareError) {
        if (shareError.code === "23505") {
          toast({
            title: "Déjà partagé",
            description: "Ce prompt est déjà partagé avec cet utilisateur",
            variant: "destructive",
          });
          return;
        }
        throw shareError;
      }

      toast({
        title: "Prompt partagé",
        description: `Le prompt a été partagé avec ${email} en ${permission === "READ" ? "lecture seule" : "lecture/écriture"}`,
      });

      setEmail("");
      setPermission("READ");
      await loadShares();
    } catch (error) {
      console.error("Error sharing prompt:", error);
      toast({
        title: "Erreur",
        description: "Impossible de partager le prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from("prompt_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      toast({
        title: "Partage supprimé",
        description: "L'accès au prompt a été retiré",
      });

      await loadShares();
    } catch (error) {
      console.error("Error deleting share:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le partage",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = async (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen) {
      await loadShares();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Partager "{promptTitle}"</DialogTitle>
          <DialogDescription>
            Partagez ce prompt avec d'autres utilisateurs en lecture seule ou avec
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

          <Button onClick={handleShare} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
