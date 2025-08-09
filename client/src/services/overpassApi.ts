// OverpassAPI Service für das Laden von Cafés in der Nähe
export interface NearbyCafe {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  amenity: string;
  tags: Record<string, string>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

export class OverpassApiService {
  private static readonly BASE_URL = 'https://overpass-api.de/api/interpreter';
  
  // Konfigurierbare Parameter
  private static readonly DEFAULT_RADIUS_KM = 10;
  private static readonly DEFAULT_MAX_RESULTS = 10;
  
  /**
   * Lädt Cafés in der Nähe des angegebenen Standorts
   * @param lat Breitengrad des Zentrums
   * @param lng Längengrad des Zentrums
   * @param radiusKm Radius in Kilometern (Standard: 10km)
   * @param maxResults Maximale Anzahl der Ergebnisse (Standard: 10)
   * @returns Promise mit Array von NearbyCafe Objekten
   */
  static async loadNearbyCafes(
    lat: number, 
    lng: number, 
    radiusKm: number = this.DEFAULT_RADIUS_KM,
    maxResults: number = this.DEFAULT_MAX_RESULTS
  ): Promise<NearbyCafe[]> {
    try {
      console.log(`🔍 Suche Cafés in ${radiusKm}km Radius um [${lat}, ${lng}]...`);
      
      // Radius in Grad umrechnen (ungefähr 1° ≈ 111km)
      const radiusDegrees = radiusKm / 111;
      
      // Bounding Box berechnen
      const south = lat - radiusDegrees;
      const west = lng - radiusDegrees;
      const north = lat + radiusDegrees;
      const east = lng + radiusDegrees;
      
      // Overpass Query erstellen
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](${south},${west},${north},${east});
          node["amenity"="restaurant"]["cuisine"~"coffee"](${south},${west},${north},${east});
          node["shop"="coffee"](${south},${west},${north},${east});
        );
        out ${maxResults};
      `;
      
      console.log('📡 Overpass Query:', query.trim());
      
      // API Request
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query.trim()
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API Error: ${response.status} ${response.statusText}`);
      }
      
      const data: OverpassResponse = await response.json();
      console.log('✅ Overpass Response:', data);
      
      // Daten in unser Format konvertieren
      const cafes: NearbyCafe[] = data.elements.map((element, index) => {
        const name = element.tags.name || 
                    element.tags.brand || 
                    element.tags['addr:housename'] || 
                    'Café';
        
        // Adresse zusammenbauen
        const address = this.buildAddress(element.tags);
        
        return {
          id: element.id || Date.now() + index, // Fallback ID
          name,
          lat: element.lat,
          lng: element.lon,
          address,
          amenity: element.tags.amenity || 'cafe',
          tags: element.tags
        };
      });
      
      // Nach Entfernung sortieren (näher = zuerst)
      const sortedCafes = this.sortByDistance(cafes, lat, lng);
      
      console.log(`✅ ${sortedCafes.length} Cafés gefunden und sortiert`);
      return sortedCafes;
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der Cafés:', error);
      throw new Error('Fehler beim Laden der Cafés in der Nähe');
    }
  }
  
  /**
   * Baut eine Adresse aus den OSM Tags zusammen
   */
  private static buildAddress(tags: Record<string, string>): string {
    const parts: string[] = [];
    
    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    if (tags['addr:housenumber']) {
      parts.push(tags['addr:housenumber']);
    }
    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }
    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Adresse nicht verfügbar';
  }
  
  /**
   * Sortiert Cafés nach Entfernung zum gegebenen Punkt
   */
  private static sortByDistance(
    cafes: NearbyCafe[], 
    centerLat: number, 
    centerLng: number
  ): NearbyCafe[] {
    return cafes.sort((a, b) => {
      const distanceA = this.calculateDistance(centerLat, centerLng, a.lat, a.lng);
      const distanceB = this.calculateDistance(centerLat, centerLng, b.lat, b.lng);
      return distanceA - distanceB;
    });
  }
  
  /**
   * Berechnet die Luftlinien-Entfernung zwischen zwei Punkten (Haversine-Formel)
   */
  private static calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Erdradius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in km
  }
  
  /**
   * Konvertiert Grad in Radiant
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
