export type Application = {
  id: string
  position: string
  status: "applied" | "interview" | "offer" | "rejected"
  applicationDate: string
  notes?: string
  companyId: number
  createdAt: string
  updatedAt: string
  company: {
    id: number
    name: string
  }
}

export type Company = {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  notes?: string;
}