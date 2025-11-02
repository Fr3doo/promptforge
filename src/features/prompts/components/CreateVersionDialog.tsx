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
import { messages } from "@/constants/messages";
import { AI_METADATA_LIMITS } from "@/constants/validation-limits";

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
              ? messages.permissions.noPermissionToCreateVersion
              : !hasUnsavedChanges 
              ? messages.permissions.noChangesToVersion
              : ""
          }
        >
          <GitBranch className="h-4 w-4" />
          {messages.buttons.createVersion}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{messages.dialogs.createVersion.title}</DialogTitle>
          <DialogDescription>
            {hasUnsavedChanges 
              ? messages.dialogs.createVersion.descriptionWithChanges
              : messages.dialogs.createVersion.descriptionNoChanges}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{messages.versions.typeLabel}</Label>
            <RadioGroup value={versionType} onValueChange={(v) => onTypeChange(v as VersionBump)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="major" id="major" />
                <Label htmlFor="major" className="cursor-pointer font-normal">
                  <span className="font-semibold">{messages.versions.typeMajor}</span> - {messages.versions.typeMajorDescription} (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "major")}</code>
                  )
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor" id="minor" />
                <Label htmlFor="minor" className="cursor-pointer font-normal">
                  <span className="font-semibold">{messages.versions.typeMinor}</span> - {messages.versions.typeMinorDescription} (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "minor")}</code>
                  )
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patch" id="patch" />
                <Label htmlFor="patch" className="cursor-pointer font-normal">
                  <span className="font-semibold">{messages.versions.typePatch}</span> - {messages.versions.typePatchDescription} (
                  <code className="font-mono text-xs">{bumpVersion(currentVersion, "patch")}</code>
                  )
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{messages.versions.messageLabel}</Label>
            <Input
              id="message"
              placeholder={messages.placeholders.versionMessage}
              value={versionMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              maxLength={AI_METADATA_LIMITS.ROLE.MAX}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {messages.versions.currentVersion} : <code className="font-mono">{currentVersion}</code>
            </p>
            <p className="text-sm font-semibold mt-1">
              {messages.versions.newVersion} : <code className="font-mono text-primary">{previewVersion}</code>
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
            {isCreating ? messages.labels.creating : messages.buttons.createVersionAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
