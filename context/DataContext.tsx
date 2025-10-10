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
  },
  {
    id: 5,
    name: 'Mumbai Coastal Mangrove',
    owner: 'Rajesh Kumar',
    location: 'Mumbai, Maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    area: '150 hectares',
    creditsAvailable: 750,
    pricePerCredit: 26,
    verified: false,
    status: 'Pending Review',
    impact: '1,875 tons CO₂/year',
    image: '🏙️',
    description: 'Urban mangrove conservation in Mumbai metropolitan area',
    submittedDate: '2024-10-10',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 7500,
      species: 'Rhizophora mucronata',
      soilType: 'Muddy clay',
      waterSalinity: '25 ppt'
    },
    mlAnalysis: {
      treeCount: 7450,
      mangroveArea: 150,
      healthScore: 87,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 750,
      confidence: 92
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 6,
    name: 'Tamil Nadu Estuary Project',
    owner: 'Priya Sharma',
    location: 'Tamil Nadu, India',
    coordinates: { lat: 11.1271, lng: 78.6569 },
    area: '220 hectares',
    creditsAvailable: 1100,
    pricePerCredit: 23,
    verified: false,
    status: 'Under Verification',
    impact: '2,750 tons CO₂/year',
    image: '🌺',
    description: 'Estuary mangrove restoration with community involvement',
    submittedDate: '2024-10-08',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=11.1271,78.6569&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=11.1271,78.6569&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 11000,
      species: 'Avicennia marina',
      soilType: 'Sandy loam',
      waterSalinity: '30 ppt'
    },
    mlAnalysis: {
      treeCount: 10980,
      mangroveArea: 220,
      healthScore: 91,
      speciesDetected: ['Avicennia marina', 'Bruguiera gymnorrhiza'],
      carbonCredits: 1100,
      confidence: 95
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 7,
    name: 'Odisha Deltaic Mangrove',
    owner: 'Anil Patel',
    location: 'Odisha, India',
    coordinates: { lat: 20.2961, lng: 85.8245 },
    area: '190 hectares',
    creditsAvailable: 950,
    pricePerCredit: 24,
    verified: false,
    status: 'Pending Review',
    impact: '2,375 tons CO₂/year',
    image: '🌊',
    description: 'Delta region mangrove conservation and fish habitat',
    submittedDate: '2024-10-12',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 9500,
      species: 'Bruguiera gymnorrhiza',
      soilType: 'Silty clay',
      waterSalinity: '28 ppt'
    },
    mlAnalysis: {
      treeCount: 9470,
      mangroveArea: 190,
      healthScore: 89,
      speciesDetected: ['Bruguiera gymnorrhiza', 'Rhizophora mucronata'],
      carbonCredits: 950,
      confidence: 94
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 8,
    name: 'Goa Coastal Restoration',
    owner: 'Maria Fernandes',
    location: 'Goa, India',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    area: '95 hectares',
    creditsAvailable: 475,
    pricePerCredit: 27,
    verified: true,
    status: 'Active',
    impact: '1,188 tons CO₂/year',
    image: '🏖️',
    description: 'Tourism-friendly mangrove conservation project',
    submittedDate: '2024-09-25',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=15.2993,74.1240&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=15.2993,74.1240&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 4750,
      species: 'Sonneratia apetala',
      soilType: 'Sandy',
      waterSalinity: '26 ppt'
    },
    mlAnalysis: {
      treeCount: 4730,
      mangroveArea: 95,
      healthScore: 86,
      speciesDetected: ['Sonneratia apetala', 'Avicennia marina'],
      carbonCredits: 475,
      confidence: 91
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance', 'Tourism Board Approval']
  },
  {
    id: 9,
    name: 'Karnataka Coastal Belt',
    owner: 'Suresh Reddy',
    location: 'Karnataka, India',
    coordinates: { lat: 14.8520, lng: 74.1350 },
    area: '135 hectares',
    creditsAvailable: 675,
    pricePerCredit: 25,
    verified: false,
    status: 'Under Verification',
    impact: '1,688 tons CO₂/year',
    image: '🌴',
    description: 'Mangrove reforestation along Karnataka coast',
    submittedDate: '2024-10-09',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=14.8520,74.1350&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=14.8520,74.1350&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 6750,
      species: 'Rhizophora mucronata',
      soilType: 'Clay loam',
      waterSalinity: '27 ppt'
    },
    mlAnalysis: {
      treeCount: 6720,
      mangroveArea: 135,
      healthScore: 88,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 675,
      confidence: 93
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 10,
    name: 'Lakshadweep Marine Sanctuary',
    owner: 'Ahmed Ali',
    location: 'Lakshadweep, India',
    coordinates: { lat: 10.5667, lng: 72.6417 },
    area: '275 hectares',
    creditsAvailable: 1375,
    pricePerCredit: 30,
    verified: true,
    status: 'Active',
    impact: '3,438 tons CO₂/year',
    image: '🏝️',
    description: 'Island mangrove ecosystem with coral reef protection',
    submittedDate: '2024-09-18',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 13750,
      species: 'Rhizophora mucronata',
      soilType: 'Coral sand',
      waterSalinity: '32 ppt'
    },
    mlAnalysis: {
      treeCount: 13700,
      mangroveArea: 275,
      healthScore: 95,
      speciesDetected: ['Rhizophora mucronata', 'Bruguiera gymnorrhiza', 'Sonneratia apetala'],
      carbonCredits: 1375,
      confidence: 97
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance', 'Marine Board Approval']
  },
  {
    id: 11,
    name: 'Pichavaram Mangrove Forest',
    owner: 'Eco Warriors Foundation',
    location: 'Tamil Nadu, India',
    coordinates: { lat: 11.4274, lng: 79.7722 },
    area: '280 hectares',
    creditsAvailable: 1420,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '3,550 tons CO₂/year',
    image: '🌿',
    description: 'One of the largest mangrove forests in India with rich biodiversity',
    submittedDate: '2024-09-28',
    images: ['📷', '📷', '📷', '📷'],
    fieldData: {
      trees: 14200,
      species: 'Avicennia marina',
      soilType: 'Estuarine mud',
      waterSalinity: '26 ppt'
    },
    mlAnalysis: {
      treeCount: 14180,
      mangroveArea: 280,
      healthScore: 90,
      speciesDetected: ['Avicennia marina', 'Rhizophora apiculata', 'Bruguiera cylindrica'],
      carbonCredits: 1420,
      confidence: 94
    },
    documents: ['Forest Department Certificate', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 12,
    name: 'Bhitarkanika National Park Extension',
    owner: 'Green Earth Society',
    location: 'Odisha, India',
    coordinates: { lat: 20.7186, lng: 87.0333 },
    area: '310 hectares',
    creditsAvailable: 1580,
    pricePerCredit: 26,
    verified: true,
    status: 'Active',
    impact: '4,100 tons CO₂/year',
    image: '🐊',
    description: 'Extension of Bhitarkanika wetlands with rich mangrove diversity',
    submittedDate: '2024-10-02',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 15800,
      species: 'Heritiera fomes',
      soilType: 'Deltaic alluvium',
      waterSalinity: '22 ppt'
    },
    mlAnalysis: {
      treeCount: 15750,
      mangroveArea: 310,
      healthScore: 93,
      speciesDetected: ['Heritiera fomes', 'Excoecaria agallocha', 'Ceriops decandra'],
      carbonCredits: 1580,
      confidence: 97
    },
    documents: ['National Park Permit', 'Wildlife Clearance', 'Survey Report']
  },
  {
    id: 13,
    name: 'Coringa Wildlife Sanctuary Buffer',
    owner: 'Coastal Protection Trust',
    location: 'Andhra Pradesh, India',
    coordinates: { lat: 16.7500, lng: 82.2333 },
    area: '195 hectares',
    creditsAvailable: 990,
    pricePerCredit: 23,
    verified: true,
    status: 'Active',
    impact: '2,480 tons CO₂/year',
    image: '🦜',
    description: 'Buffer zone restoration supporting wildlife sanctuary',
    submittedDate: '2024-09-25',
    images: ['📷', '📷'],
    fieldData: {
      trees: 9900,
      species: 'Avicennia officinalis',
      soilType: 'Muddy',
      waterSalinity: '24 ppt'
    },
    mlAnalysis: {
      treeCount: 9880,
      mangroveArea: 195,
      healthScore: 88,
      speciesDetected: ['Avicennia officinalis', 'Sonneratia apetala'],
      carbonCredits: 990,
      confidence: 91
    },
    documents: ['Wildlife Sanctuary NOC', 'Survey Report']
  },
  {
    id: 14,
    name: 'Konkan Coast Restoration',
    owner: 'Blue Planet Initiative',
    location: 'Maharashtra, India',
    coordinates: { lat: 17.9689, lng: 73.0125 },
    area: '165 hectares',
    creditsAvailable: 840,
    pricePerCredit: 25,
    verified: true,
    status: 'Active',
    impact: '2,100 tons CO₂/year',
    image: '⛵',
    description: 'Coastal protection and mangrove restoration along Konkan coast',
    submittedDate: '2024-10-05',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 8400,
      species: 'Rhizophora mucronata',
      soilType: 'Sandy clay',
      waterSalinity: '29 ppt'
    },
    mlAnalysis: {
      treeCount: 8390,
      mangroveArea: 165,
      healthScore: 89,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 840,
      confidence: 93
    },
    documents: ['Coastal Regulation Zone Clearance', 'Survey Report']
  },
  {
    id: 15,
    name: 'Chilika Lake Mangrove Buffer',
    owner: 'Wetlands Forever',
    location: 'Odisha, India',
    coordinates: { lat: 19.7167, lng: 85.3167 },
    area: '220 hectares',
    creditsAvailable: 1120,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '2,800 tons CO₂/year',
    image: '🦩',
    description: 'Protecting Asia\'s largest brackish water lagoon ecosystem',
    submittedDate: '2024-09-30',
    images: ['📷', '📷', '📷', '📷'],
    fieldData: {
      trees: 11200,
      species: 'Excoecaria agallocha',
      soilType: 'Lagoon sediment',
      waterSalinity: '18 ppt'
    },
    mlAnalysis: {
      treeCount: 11180,
      mangroveArea: 220,
      healthScore: 92,
      speciesDetected: ['Excoecaria agallocha', 'Avicennia alba', 'Acanthus ilicifolius'],
      carbonCredits: 1120,
      confidence: 95
    },
    documents: ['Ramsar Site NOC', 'Environmental Clearance', 'Survey Report']
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

