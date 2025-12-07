import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({ message = "Loading...", fullPage = false }: LoadingStateProps) {
  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader variant="spinner" size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4">
        <Loader variant="spinner" size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
}
