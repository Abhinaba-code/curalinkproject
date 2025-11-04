import { mockPublications } from "@/lib/data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Share2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PublicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Explore Medical Publications
        </h1>
        <p className="text-muted-foreground">
          Stay up-to-date with the latest medical research.
        </p>
      </div>

       <div className="flex items-center gap-4">
        <Input placeholder="Search by title, author, or keyword..." className="max-w-lg"/>
      </div>
      
      <div className="grid gap-6">
        {mockPublications.map((pub) => (
          <Card key={pub.id}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">{pub.title}</CardTitle>
              <CardDescription>{pub.authors.join(", ")} &middot; <span className="italic">{pub.journal}, {pub.year}</span></CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{pub.abstract}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button variant="ghost" size="sm">
                <Bot className="mr-2 h-4 w-4" />
                AI Summary
              </Button>
               <div className="flex gap-1">
                <Button variant="ghost" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
