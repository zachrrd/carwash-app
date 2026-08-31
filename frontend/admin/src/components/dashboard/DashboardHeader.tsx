import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DashboardHeader() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, Admin
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening at your carwash today.
        </p>
      </div>

      <Card className="flex w-fit items-center gap-3 px-4 py-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Today</p>

          <p className="text-sm font-semibold">{formattedDate}</p>
        </div>
      </Card>
    </div>
  );
}
