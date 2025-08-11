"use client"

import { useState } from "react"
import {
  Search,
  Grid3X3,
  List,
  Star,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Globe,
  Target,
  Briefcase,
  Calendar,
  UserCheck,
  Building,
  Scale,
  AppWindow,
  Zap,
  Eye,
  TestTube,
  MapPin,
  Hash,
  Layers,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Application data structure
interface Application {
  id: string
  name: string
  description?: string
  icon: any
  color: string
  favorite?: boolean
}

interface Team {
  id: string
  name: string
  description: string
  color: string
  applications: Application[]
}

// Teams and applications data
const teamsData: Team[] = [
  {
    id: "marketing",
    name: "Marketing Team",
    description: "Campaign management and marketing automation tools",
    color: "blue",
    applications: [
      {
        id: "campaign-mgmt",
        name: "Campaign Management",
        description: "Manage and optimize marketing campaigns",
        icon: TrendingUp,
        color: "bg-blue-500",
        favorite: true,
      },
      {
        id: "budget-allocation",
        name: "Budget Allocation",
        description: "Distribute marketing budget across channels",
        icon: DollarSign,
        color: "bg-green-500",
      },
      {
        id: "cost-distribution",
        name: "Cost Distribution",
        description: "Analyze cost distribution across campaigns",
        icon: BarChart3,
        color: "bg-purple-500",
      },
      {
        id: "smart-bidding",
        name: "Smart Bidding",
        description: "AI-powered bidding optimization",
        icon: Zap,
        color: "bg-yellow-500",
        favorite: true,
      },
      {
        id: "creative-mgmt",
        name: "Creative Management",
        description: "Manage creative assets and variations",
        icon: Eye,
        color: "bg-pink-500",
      },
    ],
  },
  {
    id: "monetization",
    name: "Monetization Team",
    description: "Revenue optimization and testing tools",
    color: "green",
    applications: [
      {
        id: "ecpm-prediction",
        name: "eCPM Prediction",
        description: "Predict effective cost per mille",
        icon: Target,
        color: "bg-emerald-500",
        favorite: true,
      },
      {
        id: "ab-testing",
        name: "A/B Testing",
        description: "Run and analyze A/B experiments",
        icon: TestTube,
        color: "bg-cyan-500",
      },
    ],
  },
  {
    id: "aso",
    name: "ASO Team",
    description: "App Store Optimization and keyword management",
    color: "orange",
    applications: [
      {
        id: "localization",
        name: "Localization",
        description: "Manage app localization across markets",
        icon: Globe,
        color: "bg-indigo-500",
      },
      {
        id: "keyword-tracking",
        name: "Keyword Tracking",
        description: "Track keyword rankings and performance",
        icon: MapPin,
        color: "bg-red-500",
        favorite: true,
      },
      {
        id: "keyword-density",
        name: "Keyword Density",
        description: "Analyze keyword density optimization",
        icon: Hash,
        color: "bg-orange-500",
      },
    ],
  },
  {
    id: "back-office",
    name: "Back-Office",
    description: "Internal operations and management systems",
    color: "gray",
    applications: [
      {
        id: "hrm",
        name: "HRM",
        description: "Human Resource Management System",
        icon: Users,
        color: "bg-slate-500",
      },
      {
        id: "recruitment",
        name: "Recruitment",
        description: "Talent acquisition and hiring platform",
        icon: UserCheck,
        color: "bg-blue-600",
      },
      {
        id: "canteen",
        name: "Canteen",
        description: "Cafeteria management and meal ordering",
        icon: Calendar,
        color: "bg-green-600",
      },
      {
        id: "meeting-room",
        name: "Meeting Room",
        description: "Conference room booking system",
        icon: Building,
        color: "bg-purple-600",
      },
      {
        id: "asset-mgmt",
        name: "Asset Management",
        description: "Company asset tracking and management",
        icon: Layers,
        color: "bg-gray-600",
      },
    ],
  },
  {
    id: "bod",
    name: "BoD",
    description: "Board of Directors executive tools",
    color: "red",
    applications: [
      {
        id: "finance",
        name: "Finance",
        description: "Financial reporting and analytics",
        icon: Briefcase,
        color: "bg-emerald-600",
        favorite: true,
      },
      {
        id: "legal-mgmt",
        name: "Legal Management",
        description: "Legal document and compliance management",
        icon: Scale,
        color: "bg-red-600",
      },
    ],
  },
]

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(teamsData.flatMap((team) => team.applications.filter((app) => app.favorite).map((app) => app.id))),
  )

  // Toggle favorite status
  const toggleFavorite = (appId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(appId)) {
      newFavorites.delete(appId)
    } else {
      newFavorites.add(appId)
    }
    setFavorites(newFavorites)
  }

  // Filter applications based on search term
  const filteredTeams = teamsData
    .map((team) => ({
      ...team,
      applications: team.applications.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((team) => team.applications.length > 0)

  // Application Card Component
  const ApplicationCard = ({ app }: { app: Application }) => {
    const Icon = app.icon
    const isFavorite = favorites.has(app.id)

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg text-white flex-shrink-0", app.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate text-sm">{app.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(app.id)
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400",
                    )}
                  />
                </button>
              </div>
              {app.description && <p className="text-xs text-gray-500 line-clamp-2">{app.description}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Team Section Component
  const TeamSection = ({ team }: { team: Team }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{team.name}</h2>
          <p className="text-sm text-gray-500">{team.description}</p>
        </div>
        <Badge
          className={cn(
            "text-xs",
            team.color === "blue" && "bg-blue-100 text-blue-700",
            team.color === "green" && "bg-green-100 text-green-700",
            team.color === "orange" && "bg-orange-100 text-orange-700",
            team.color === "gray" && "bg-gray-100 text-gray-700",
            team.color === "red" && "bg-red-100 text-red-700",
          )}
        >
          {team.applications.length} apps
        </Badge>
      </div>

      <div
        className={cn(
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2",
        )}
      >
        {team.applications.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )

  const displayTeams = searchTerm ? filteredTeams : teamsData

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 mt-1">Access all your business applications organized by team.</p>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {searchTerm && (
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">Search Results for "{searchTerm}"</h2>
          </div>
        )}

        {displayTeams.length > 0 ? (
          displayTeams.map((team) => <TeamSection key={team.id} team={team} />)
        ) : (
          <div className="text-center py-12">
            <AppWindow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
