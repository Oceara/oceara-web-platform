import { createClient } from '@/lib/supabase/client'

export interface Project {
  id: string
  name: string
  owner: string
  owner_email?: string
  location: string
  coordinates: { lat: number; lng: number }
  area: string
  credits_available: number
  price_per_credit: number
  verified: boolean
  status: 'Pending Review' | 'Under Verification' | 'Verified' | 'Active' | 'Rejected'
  impact?: string
  image?: string
  description?: string
  submitted_date: string
  images?: string[]
  satellite_images?: string[]
  field_data?: {
    trees: number
    species: string
    soilType: string
    waterSalinity: string
  }
  ml_analysis?: {
    treeCount: number
    mangroveArea: number
    healthScore: number
    speciesDetected: string[]
    carbonCredits: number
    confidence: number
  }
  documents?: string[]
  created_at?: string
  updated_at?: string
}

// Convert database format to app format
function dbToApp(project: any): Project {
  return {
    id: project.id,
    name: project.name,
    owner: project.owner,
    owner_email: project.owner_email,
    location: project.location,
    coordinates: project.coordinates,
    area: project.area,
    credits_available: project.credits_available,
    price_per_credit: parseFloat(project.price_per_credit),
    verified: project.verified,
    status: project.status,
    impact: project.impact,
    image: project.image,
    description: project.description,
    submitted_date: project.submitted_date || project.created_at,
    images: project.images || [],
    satellite_images: project.satellite_images || [],
    field_data: project.field_data,
    ml_analysis: project.ml_analysis,
    documents: project.documents || [],
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

// Convert app format to database format
function appToDb(project: Partial<Project>): any {
  return {
    name: project.name,
    owner: project.owner,
    owner_email: project.owner_email,
    location: project.location,
    coordinates: project.coordinates,
    area: project.area,
    credits_available: project.credits_available,
    price_per_credit: project.price_per_credit,
    verified: project.verified,
    status: project.status,
    impact: project.impact,
    image: project.image,
    description: project.description,
    images: project.images,
    satellite_images: project.satellite_images,
    field_data: project.field_data,
    ml_analysis: project.ml_analysis,
    documents: project.documents,
  }
}

export class ProjectsDatabase {
  private supabase: any

  constructor() {
    this.supabase = createClient()
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching project:', error)
      throw error
    }

    return data ? dbToApp(data) : null
  }

  async getProjectsByOwner(owner: string): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner', owner)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects by owner:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getProjectsByOwnerEmail(email: string): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner_email', email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects by owner email:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getPendingProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .in('status', ['Pending Review', 'Under Verification'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async getVerifiedProjects(): Promise<Project[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('verified', true)
      .in('status', ['Verified', 'Active'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching verified projects:', error)
      throw error
    }

    return (data || []).map(dbToApp)
  }

  async createProject(project: Omit<Project, 'id' | 'submitted_date' | 'created_at' | 'updated_at'>): Promise<Project> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const projectData = appToDb(project)

    const { data, error } = await this.supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw error
    }

    return dbToApp(data)
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const updateData = appToDb(updates)

    const { data, error } = await this.supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw error
    }

    return dbToApp(data)
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  async isConfigured(): Promise<boolean> {
    return this.supabase !== null && 
           !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
           !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}
