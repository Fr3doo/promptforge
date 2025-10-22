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
import { messages } from "@/constants/messages";

interface PublicShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptTitle: string;
  currentVisibility: "PRIVATE" | "SHARED";
  currentPermission: "READ" | "WRITE";
  onConfirm: (permission?: "READ" | "WRITE") => Promise<void>;
  onUpdatePermission?: (permission: "READ" | "WRITE") => Promise<void>;
}

export const PublicShareDialog = ({
  open,
  onOpenChange,
  promptTitle,
  currentVisibility,
  currentPermission,
  onConfirm,
  onUpdatePermission,
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentVisibility === "PRIVATE" 
              ? messages.dialogs.publicShare.titlePrivate(promptTitle)
              : messages.dialogs.publicShare.titleShared(promptTitle)}
          </DialogTitle>
          <DialogDescription>
            {currentVisibility === "PRIVATE"
              ? messages.dialogs.publicShare.descriptionPrivate
              : messages.dialogs.publicShare.descriptionShared}
          </DialogDescription>
        </DialogHeader>

        {currentVisibility === "SHARED" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permission">{messages.permissions.publicAccess}</Label>
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
              <p className="text-sm text-muted-foreground">
                {permission === "READ"
                  ? messages.permissions.readOnlyDescription
                  : messages.permissions.readWriteDescription}
              </p>
            </div>
          </div>
        )}

        {currentVisibility === "PRIVATE" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permission">{messages.permissions.publicAccess}</Label>
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
              <p className="text-sm text-muted-foreground">
                {permission === "READ"
                  ? messages.permissions.readOnlyDescription
                  : messages.permissions.readWriteDescription}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {messages.labels.cancel}
          </Button>
          {currentVisibility === "SHARED" && (
            <>
              {onUpdatePermission && (
                <Button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await onUpdatePermission(permission);
                      onOpenChange(false);
                    } finally {
                      setIsLoading(false);
                    }
                  }} 
                  disabled={isLoading || permission === currentPermission}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {messages.buttons.updatePermission}
                </Button>
              )}
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
                {messages.buttons.stopPublicSharing}
              </Button>
            </>
          )}
          {currentVisibility === "PRIVATE" && (
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {messages.buttons.enablePublicSharing}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
