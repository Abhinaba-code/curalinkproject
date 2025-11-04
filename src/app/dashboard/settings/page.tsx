import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Adjust your account and notification settings.
        </p>
      </div>
      <Card className="flex items-center justify-center h-96 border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Settings className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Settings Page</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">This section is under construction.</p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
