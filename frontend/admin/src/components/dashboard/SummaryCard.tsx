import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  desc: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export default function SummaryCard({
  title,
  value,
  desc,
  icon: Icon,
  iconColor,
  bgColor,
}: SummaryCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgColor}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
