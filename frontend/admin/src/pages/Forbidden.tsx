import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Forbidden() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>

          <p className="text-6xl font-bold tracking-tight">403</p>

          <h1 className="mt-3 text-2xl font-bold">Access Forbidden</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>

            <Button className="flex-1" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
