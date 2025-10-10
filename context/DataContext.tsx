'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Project {
  id: number
  name: string
  owner: string
  location: string
  coordinates: { lat: number; lng: number }
  area: string
  creditsAvailable: number
  pricePerCredit: number
  verified: boolean
  status: 'Pending Review' | 'Under Verification' | 'Verified' | 'Active' | 'Rejected'
  impact: string
  image: string
  description: string
  submittedDate: string
  images: string[]
  satelliteImages?: string[]
  fieldData?: {
    trees: number
    species: string
    soilType: string
    waterSalinity: string
  }
  mlAnalysis?: {
    treeCount: number
    mangroveArea: number
    healthScore: number
    speciesDetected: string[]
    carbonCredits: number
    confidence: number
  }
  documents?: string[]
}

interface DataContextType {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'submittedDate'>) => void
  updateProject: (id: number, updates: Partial<Project>) => void
  deleteProject: (id: number) => void
  getProjectsByOwner: (owner: string) => Project[]
  getPendingProjects: () => Project[]
  getVerifiedProjects: () => Project[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEY = 'oceara_projects_data'

// Initial mock data
const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Sundarbans Mangrove Conservation',
    owner: 'Demo Landowner',
    location: 'West Bengal, India',
    coordinates: { lat: 21.9497, lng: 88.8837 },
    area: '250 hectares',
    creditsAvailable: 1250,
    pricePerCredit: 25,
    verified: true,
    status: 'Active',
    impact: '3,125 tons CO₂/year',
    image: '🌴',
    description: 'Largest mangrove forest restoration project in India',
    submittedDate: '2024-09-15',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 12500,
      species: 'Rhizophora mucronata',
      soilType: 'Muddy clay',
      waterSalinity: '25 ppt'
    },
    mlAnalysis: {
      treeCount: 12450,
      mangroveArea: 250,
      healthScore: 87,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 1250,
      confidence: 92
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 2,
    name: 'Kerala Backwater Restoration',
    owner: 'Demo Landowner',
    location: 'Kerala, India',
    coordinates: { lat: 9.9312, lng: 76.2673 },
    area: '180 hectares',
    creditsAvailable: 890,
    pricePerCredit: 22,
    verified: true,
    status: 'Active',
    impact: '2,225 tons CO₂/year',
    image: '🌊',
    description: 'Coastal ecosystem restoration in Kerala backwaters',
    submittedDate: '2024-10-01',
    images: ['📷', '📷'],
    fieldData: {
      trees: 8900,
      species: 'Avicennia marina',
      soilType: 'Sandy loam',
      waterSalinity: '30 ppt'
    },
    mlAnalysis: {
      treeCount: 8880,
      mangroveArea: 180,
      healthScore: 91,
      speciesDetected: ['Avicennia marina', 'Bruguiera gymnorrhiza'],
      carbonCredits: 890,
      confidence: 95
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 3,
    name: 'Andaman Islands Blue Carbon',
    owner: 'Demo User 2',
    location: 'Andaman & Nicobar, India',
    coordinates: { lat: 11.7401, lng: 92.6586 },
    area: '320 hectares',
    creditsAvailable: 1600,
    pricePerCredit: 28,
    verified: true,
    status: 'Active',
    impact: '4,480 tons CO₂/year',
    image: '🏝️',
    description: 'Pristine mangrove conservation in Andaman Islands',
    submittedDate: '2024-09-20',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 16000,
      species: 'Rhizophora mucronata',
      soilType: 'Coral sand',
      waterSalinity: '28 ppt'
    },
    mlAnalysis: {
      treeCount: 15980,
      mangroveArea: 320,
      healthScore: 94,
      speciesDetected: ['Rhizophora mucronata', 'Bruguiera gymnorrhiza', 'Sonneratia apetala'],
      carbonCredits: 1600,
      confidence: 96
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 4,
    name: 'Gujarat Coastal Protection',
    owner: 'Demo User 3',
    location: 'Gujarat, India',
    coordinates: { lat: 21.5222, lng: 70.4579 },
    area: '200 hectares',
    creditsAvailable: 1000,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '2,500 tons CO₂/year',
    image: '🌅',
    description: 'Mangrove plantation for coastal protection',
    submittedDate: '2024-10-05',
    images: ['📷', '📷'],
    fieldData: {
      trees: 10000,
      species: 'Avicennia marina',
      soilType: 'Clay',
      waterSalinity: '32 ppt'
    },
    mlAnalysis: {
      treeCount: 9950,
      mangroveArea: 200,
      healthScore: 88,
      speciesDetected: ['Avicennia marina'],
      carbonCredits: 1000,
      confidence: 93
    },
    documents: ['Land Deed', 'Survey Report']
  }
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProjects(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading data:', error)
        setProjects(initialProjects)
      }
    } else {
      setProjects(initialProjects)
    }
    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }
  }, [projects, isLoaded])

  const addProject = (project: Omit<Project, 'id' | 'submittedDate'>) => {
    const newProject: Project = {
      ...project,
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      submittedDate: new Date().toISOString().split('T')[0]
    }
    setProjects(prev => [...prev, newProject])
  }

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    )
  }

  const deleteProject = (id: number) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }

  const getProjectsByOwner = (owner: string) => {
    return projects.filter(project => project.owner === owner)
  }

  const getPendingProjects = () => {
    return projects.filter(project =>
      project.status === 'Pending Review' || project.status === 'Under Verification'
    )
  }

  const getVerifiedProjects = () => {
    return projects.filter(project =>
      project.verified && (project.status === 'Verified' || project.status === 'Active')
    )
  }

  return (
    <DataContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectsByOwner,
        getPendingProjects,
        getVerifiedProjects
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

