import { Button } from "@/components/ui/button";
import { Clock, CarFront, CheckCircle2 } from "lucide-react";

export default function StatusTabs() {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
      <Button
        variant="outline"
        className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
      >
        <Clock className="mr-2 h-4 w-4" /> Waiting (5)
      </Button>
      <Button variant="ghost" className="text-slate-500 hover:bg-slate-100">
        <CarFront className="mr-2 h-4 w-4" /> In Progress (3)
      </Button>
      <Button variant="ghost" className="text-slate-500 hover:bg-slate-100">
        <CheckCircle2 className="mr-2 h-4 w-4" /> Completed (Unpaid) (2)
      </Button>
    </div>
  );
}
