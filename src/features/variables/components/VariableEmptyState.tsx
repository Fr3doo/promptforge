import { Card } from "@/components/ui/card";
import { messages } from "@/constants/messages";

interface VariableEmptyStateProps {
  message?: string;
}

export const VariableEmptyState = ({
  message = messages.variables.emptyState,
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
