import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GuidelineHistory } from "@/lib/db/schema";

interface GuidelineHistoryTimelineProps {
  history: GuidelineHistory[];
}

export function GuidelineHistoryTimeline({ history }: GuidelineHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">No version history yet.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedHistory = [...history].sort((a, b) => b.version - a.version);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {sortedHistory.map((entry, index) => (
              <div
                key={entry.id}
                className="relative pl-6 pb-4 border-l-2 border-muted last:border-transparent"
              >
                {/* Version indicator */}
                <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                {/* Version info */}
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    Version {entry.version}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-sm text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>

                {/* Content preview */}
                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <p className="line-clamp-2">
                    {typeof entry.content === "object"
                      ? JSON.stringify(entry.content).substring(0, 100) + "..."
                      : String(entry.content).substring(0, 100) + "..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
