import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MetadataViewProps {
  metadata: {
    role: string;
    objectifs: string[];
    etapes?: string[];
    criteres?: string[];
    categories?: string[];
  };
}

export function MetadataView({ metadata }: MetadataViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Rôle</h3>
        <p className="text-sm text-muted-foreground">{metadata.role}</p>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-2">Objectifs</h3>
        <ul className="list-disc list-inside space-y-1">
          {metadata.objectifs.map((obj, i) => (
            <li key={i} className="text-sm text-muted-foreground break-words">{obj}</li>
          ))}
        </ul>
      </div>

      {metadata.etapes && metadata.etapes.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Étapes</h3>
            <ol className="list-decimal list-inside space-y-1">
              {metadata.etapes.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground break-words">{step}</li>
              ))}
            </ol>
          </div>
        </>
      )}

      {metadata.criteres && metadata.criteres.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Critères de qualité</h3>
            <ul className="list-disc list-inside space-y-1">
              {metadata.criteres.map((crit, i) => (
                <li key={i} className="text-sm text-muted-foreground break-words">{crit}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {metadata.categories && metadata.categories.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Tags suggérés</h3>
            <div className="flex flex-wrap gap-2">
              {metadata.categories.map((cat, i) => (
                <Badge key={i} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
