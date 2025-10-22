import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GitBranch, Loader2 } from "lucide-react";
import { bumpVersion, type VersionBump } from "@/lib/semver";

interface CreateVersionDialogProps {
  currentVersion: string;
  versionMessage: string;
  versionType: VersionBump;
  onMessageChange: (message: string) => void;
  onTypeChange: (type: VersionBump) => void;
  onConfirm: () => void;
  isCreating: boolean;
  hasUnsavedChanges: boolean;
  disabled?: boolean;
}

export function CreateVersionDialog({
  currentVersion,
  versionMessage,
  versionType,
  onMessageChange,
  onTypeChange,
  onConfirm,
  isCreating,
  hasUnsavedChanges,
  disabled = false,
}: CreateVersionDialogProps) {
  const previewVersion = bumpVersion(currentVersion, versionType);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={!hasUnsavedChanges || disabled}
          title={
            disabled 
              ? "Vous n'avez pas la permission de créer une version" 
              : !hasUnsavedChanges 
              ? "Aucune modification à versionner" 
              : ""
          }
        >
          <GitBranch className="h-4 w-4" />
          Créer une version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle version</DialogTitle>
          <DialogDescription>
            {hasUnsavedChanges 
              ? "Sauvegardez une version de ce prompt pour suivre son évolution"
              : "Modifiez d'abord votre prompt pour créer une nouvelle version"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type de version</Label>
            <RadioGroup value={versionType} onValueChange={(v) => onTypeChange(v as VersionBump)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="major" id="major" />
                <Label htmlFor="major" className="cursor-pointer font-normal">
                  <span className="font-semibold">Major</span> - Changements incompatibles (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "major")}</code>
                  )
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor" id="minor" />
                <Label htmlFor="minor" className="cursor-pointer font-normal">
                  <span className="font-semibold">Minor</span> - Nouvelles fonctionnalités (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "minor")}</code>
                  )
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patch" id="patch" />
                <Label htmlFor="patch" className="cursor-pointer font-normal">
                  <span className="font-semibold">Patch</span> - Corrections mineures (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "patch")}</code>
                  )
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Input
              id="message"
              placeholder="Décrivez les changements..."
              value={versionMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Version actuelle : <code className="font-mono">{currentVersion}</code>
            </p>
            <p className="text-sm font-semibold mt-1">
              Nouvelle version : <code className="font-mono text-primary">{previewVersion}</code>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onConfirm} 
            disabled={isCreating || !hasUnsavedChanges} 
            className="gap-2"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCreating ? "Création..." : "Créer la version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
