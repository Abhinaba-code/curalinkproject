import { mockExperts } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Plus } from "lucide-react"

export default function ExpertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Connect with Experts
        </h1>
        <p className="text-muted-foreground">
          Find collaborators and specialists in your field.
        </p>
      </div>

       <div className="flex items-center gap-4">
        <Input placeholder="Search by name, specialty, or institution..." className="max-w-lg"/>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockExperts.map((expert) => (
          <Card key={expert.id} className="text-center">
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="font-headline text-2xl">{expert.name}</CardTitle>
              <CardDescription>{expert.institution}</CardDescription>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {expert.specialties.map(specialty => (
                  <Badge key={specialty} variant="secondary">{specialty}</Badge>
                ))}
              </div>
               <div className="pt-4 flex justify-center gap-2">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Follow
                </Button>
                 <Button size="sm" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
