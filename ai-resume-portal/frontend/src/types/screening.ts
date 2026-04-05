export interface LearningPlanItem {
  day: string
  topic: string
  tasks: string[]
  hours: number
  priority: string
}

export interface YoutubeRecommendation {
  skill: string
  channelName: string
  searchQuery: string
  reason: string
}

export interface ScreeningResultResponse {
  id: number
  applicationId: number
  jobId?: number | null
  matchScore?: number | null
  isEligible?: boolean | null
  matchedSkills?: string[]
  missingSkills?: string[]
  strengths?: string[]
  weaknesses?: string[]
  summary?: string | null
  learningPlan?: LearningPlanItem[]
  youtubeRecommendations?: YoutubeRecommendation[]
  createdAt?: string | null
}
