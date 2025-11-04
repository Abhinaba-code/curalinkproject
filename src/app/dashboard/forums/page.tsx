import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartPulse } from "lucide-react"

export default function ForumsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Community Forums
        </h1>
        <p className="text-muted-foreground">
          Connect with patients and researchers.
        </p>
      </div>
      <Card className="flex items-center justify-center h-96 border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <HeartPulse className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Coming Soon!</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">Our community forums are under construction.</p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  )
}
