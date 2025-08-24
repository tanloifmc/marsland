export interface LandPlot {
  id: string
  land_id: string
  latitude: number
  longitude: number
  price: number
  coordinates: { lat: number; lng: number }
  position: [number, number, number]
  isOwned: boolean
  owner?: string
  purchased_at?: string
}


