import { Card } from "@/components/ui/card";

interface VariableEmptyStateProps {
  message?: string;
}

export const VariableEmptyState = ({
  message = 'Aucune variable détectée. Utilisez le bouton "Détecter variables" ou ajoutez des variables manuellement avec la syntaxe',
}: VariableEmptyStateProps) => {
  return (
    <Card className="p-8 text-center border-dashed">
      <p className="text-muted-foreground">
        {message}{" "}
        <code className="font-mono bg-muted px-1 rounded">{"{{nom}}"}</code>
      </p>
    </Card>
  );
};
