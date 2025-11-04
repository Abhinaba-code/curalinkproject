import { mockClinicalTrials } from "@/lib/data"
import TrialCard from "./trial-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TrialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Discover Clinical Trials
        </h1>
        <p className="text-muted-foreground">
          Find research studies relevant to you.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input placeholder="Search by condition, keyword, or NCT ID..." className="max-w-lg"/>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Recruiting
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              Active, not recruiting
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              Completed
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockClinicalTrials.map((trial) => (
          <TrialCard key={trial.id} trial={trial} />
        ))}
      </div>
    </div>
  )
}
