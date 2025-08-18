// OverpassAPI Service für das Laden von Cafés in der Nähe
export interface NearbyCafe {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  amenity: string;
  tags: Record<string, string>;
  // OSM-Daten für eindeutige Identifikation
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
  remark?: string; // Für Timeout- und Fehlermeldungen
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

  // Rate-Limiting (Verhindert zu viele API-Calls)
  private static lastRequestTime: number = 0;
  private static readonly MIN_REQUEST_INTERVAL = 2000; // 2 Sekunden zwischen Requests
  private static isRequestInProgress: boolean = false;
  
  // Erstellt eine optimierte Overpass Query mit den wichtigsten Suchkriterien
  private static buildOptimizedQuery(
    lat: number, 
    lng: number, 
    radiusKm: number, 
    maxResults: number
  ): string {
    // Radius in Meter umrechnen
    const radiusMeters = radiusKm * 1000;
    
    return `
      [out:json][timeout:30];
      (
        // Standard Cafés
        nwr["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
        
        // Coffee Shops
        nwr["shop"="coffee"](around:${radiusMeters},${lat},${lng});
        
        // Bäckereien
        nwr["shop"="bakery"](around:${radiusMeters},${lat},${lng});
        
        // Restaurants mit Coffee cuisine
        nwr["amenity"="restaurant"]["cuisine"~"^(coffee|café)$"](around:${radiusMeters},${lat},${lng});
        
        // Bekannte Coffee-Ketten (vereinfacht)
        nwr["brand"~"^(Starbucks|Costa|Dunkin)"](around:${radiusMeters},${lat},${lng});
      );
      out center ${maxResults * 2};
    `;
  }

  // Erstellt eine Fallback Query für erweiterte Suche
  private static buildFallbackQuery(
    lat: number, 
    lng: number, 
    radiusKm: number, 
    maxResults: number
  ): string {
    const radiusMeters = radiusKm * 1.5 * 1000; // 1.5x Radius für Fallback
    
    return `
      [out:json][timeout:30];
      (
        // Name-basierte Suche für Café-Begriffe
        nwr(around:${radiusMeters},${lat},${lng})["name"~"[Cc]af[eé]|[Cc]offee|[Kk]affee"];
        
        // Fast Food mit Coffee
        nwr["amenity"="fast_food"]["cuisine"~"coffee"](around:${radiusMeters},${lat},${lng});
        
        // Bars mit Coffee
        nwr["amenity"="bar"]["cuisine"~"coffee"](around:${radiusMeters},${lat},${lng});
        
        // Weitere bekannte Ketten
        nwr["brand"~"Tim Hortons|McCafé"](around:${radiusMeters},${lat},${lng});
      );
      out center ${maxResults};
    `;
  }

  // Erstellt eine einfache Basis-Query als Backup
  private static buildSimpleQuery(
    lat: number, 
    lng: number, 
    radiusKm: number, 
    maxResults: number
  ): string {
    const radiusMeters = radiusKm * 1000;
    
    return `
      [out:json][timeout:15];
      (
        nwr["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
        nwr["shop"="coffee"](around:${radiusMeters},${lat},${lng});
      );
      out center ${maxResults};
    `;
  }

  // Konvertiert Overpass Elements zu NearbyCafe Objekten
  private static convertElements(elements: OverpassElement[], centerLat: number, centerLng: number): NearbyCafe[] {
    return elements.map((element, index) => {
      // Für Ways nehmen wir das center, für Nodes die direkten Koordinaten
      const elementLat = (element as any).center?.lat || element.lat;
      const elementLng = (element as any).center?.lon || element.lon;
      
      // Bessere Namensextraktion
      const name = element.tags?.name || 
                   element.tags?.brand || 
                   element.tags?.operator || 
                   element.tags?.['addr:housename'] || 
                   'Café';
      
      // Adresse zusammenbauen
      const address = this.buildAddress(element.tags);
      
      // Kategorie basierend auf Tags bestimmen
      let amenity = 'cafe';
      if (element.tags?.amenity === 'restaurant') amenity = 'restaurant';
      if (element.tags?.shop === 'coffee') amenity = 'coffee_shop';
      if (element.tags?.shop === 'bakery') amenity = 'bakery';
      if (element.tags?.amenity === 'fast_food') amenity = 'fast_food';
      if (element.tags?.amenity === 'fuel') amenity = 'fuel_station';
      
      return {
        id: element.id || Date.now() + index,
        name,
        lat: elementLat,
        lng: elementLng,
        address,
        amenity,
        tags: element.tags || {},
        // OSM-Daten hinzufügen mit Type-Cast
        osmType: element.type as 'node' | 'way' | 'relation',
        osmId: element.id || Date.now() + index
      };
    });
  }

  // Entfernt Duplikate basierend auf Name und Koordinaten
  private static removeDuplicates(cafes: NearbyCafe[]): NearbyCafe[] {
    const seen = new Set<string>();
    return cafes.filter(cafe => {
      const key = `${cafe.name}_${cafe.lat.toFixed(6)}_${cafe.lng.toFixed(6)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Führt eine einfache Suche durch (Fallback bei Timeout)
  private static async performSimpleSearch(
    lat: number,
    lng: number,
    radiusKm: number,
    maxResults: number
  ): Promise<NearbyCafe[]> {
    try {
      const simpleQuery = this.buildSimpleQuery(lat, lng, radiusKm, maxResults);
      console.log('Einfache Backup Query:', simpleQuery.trim());
      
      // Performance Logging: Backup-API-Request-Zeit messen
      const backupApiStartTime = performance.now();
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: simpleQuery.trim()
      });
      
      // Performance Logging: Backup API Response Zeit
      const backupApiEndTime = performance.now();
      const backupApiResponseTime = backupApiEndTime - backupApiStartTime;
      console.log(`Backup API Response Zeit: ${backupApiResponseTime.toFixed(2)}ms`);
      
      if (!response.ok) {
        console.warn('Einfache Suche fehlgeschlagen');
        return [];
      }
      
      // Performance Logging: Backup JSON Parse Zeit
      const backupParseStartTime = performance.now();
      const data: OverpassResponse = await response.json();
      const backupParseEndTime = performance.now();
      const backupParseTime = backupParseEndTime - backupParseStartTime;
      console.log(`Backup JSON Parse Zeit: ${backupParseTime.toFixed(2)}ms`);
      
      // Performance Logging: Warnung bei langsamen Backup-Anfragen
      if (backupApiResponseTime > 5000) {
        console.warn(`LANGSAME BACKUP-ANFRAGE: ${backupApiResponseTime.toFixed(2)}ms (über 5 Sekunden!)`);
      }
      
      const simpleCafes = this.convertElements(data.elements, lat, lng);
      const uniqueCafes = this.removeDuplicates(simpleCafes);
      
      console.log(`Einfache Suche: ${uniqueCafes.length} Cafés gefunden`);
      return uniqueCafes;
      
    } catch (error) {
      console.error('Einfache Suche fehlgeschlagen:', error);
      return [];
    }
  }

  // Führt eine Fallback-Suche durch wenn zu wenige Ergebnisse gefunden wurden
  private static async performFallbackSearch(
    lat: number,
    lng: number,
    radiusKm: number,
    maxResults: number,
    existingCafes: NearbyCafe[]
  ): Promise<NearbyCafe[]> {
    try {
      const fallbackQuery = this.buildFallbackQuery(lat, lng, radiusKm, maxResults);
      console.log('Fallback Overpass Query:', fallbackQuery.trim());
      
      // Performance Logging: Fallback-API-Request-Zeit messen
      const fallbackApiStartTime = performance.now();
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: fallbackQuery.trim()
      });
      
      // Performance Logging: Fallback API Response Zeit
      const fallbackApiEndTime = performance.now();
      const fallbackApiResponseTime = fallbackApiEndTime - fallbackApiStartTime;
      console.log(`Fallback API Response Zeit: ${fallbackApiResponseTime.toFixed(2)}ms`);
      
      if (!response.ok) {
        console.warn('Fallback-Suche fehlgeschlagen');
        return existingCafes;
      }
      
      // Performance Logging: Fallback JSON Parse Zeit
      const fallbackParseStartTime = performance.now();
      const data: OverpassResponse = await response.json();
      const fallbackParseEndTime = performance.now();
      const fallbackParseTime = fallbackParseEndTime - fallbackParseStartTime;
      console.log(`Fallback JSON Parse Zeit: ${fallbackParseTime.toFixed(2)}ms`);
      
      // Performance Logging: Warnung bei langsamen Fallback-Anfragen
      if (fallbackApiResponseTime > 5000) {
        console.warn(`LANGSAME FALLBACK-ANFRAGE: ${fallbackApiResponseTime.toFixed(2)}ms (über 5 Sekunden!)`);
      }
      const fallbackCafes = this.convertElements(data.elements, lat, lng);
      
      // Kombiniere beide Ergebnisse und entferne Duplikate
      const combinedCafes = [...existingCafes, ...fallbackCafes];
      const uniqueCafes = this.removeDuplicates(combinedCafes);
      
      console.log(`Fallback-Suche: ${uniqueCafes.length} eindeutige Cafés insgesamt`);
      return uniqueCafes;
      
    } catch (error) {
      console.error('Fallback-Suche fehlgeschlagen:', error);
      return existingCafes;
    }
  }

  // Lädt Cafés in der Nähe des angegebenen Standorts
  static async loadNearbyCafes(
    lat: number, 
    lng: number, 
    radiusKm: number = this.DEFAULT_RADIUS_KM,
    maxResults: number = this.DEFAULT_MAX_RESULTS
  ): Promise<NearbyCafe[]> {
    // Performance Logging: Gesamtzeit-Messung starten
    const totalStartTime = performance.now();
    
    // Rate Limiting: Verhindert zu schnelle aufeinanderfolgende Requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (this.isRequestInProgress) {
      console.log('Request bereits in Bearbeitung, warte...');
      return [];
    }
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate Limit: Warte ${waitTime}ms vor nächstem Request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.isRequestInProgress = true;
    this.lastRequestTime = Date.now();
    
    try {
      console.log(`Suche Cafés in ${radiusKm}km Radius um [${lat}, ${lng}]...`);
      
      let cafes: NearbyCafe[] = [];
      
      // Schritt 1: Optimierte Hauptsuche
      try {
        const query = this.buildOptimizedQuery(lat, lng, radiusKm, maxResults);
        console.log('Optimierte Overpass Query:', query.trim());
        
        // Performance Logging: API-Request-Zeit messen
        const apiStartTime = performance.now();
        
        const response = await fetch(this.BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: query.trim()
        });
        
        // Performance Logging: API Response Zeit
        const apiEndTime = performance.now();
        const apiResponseTime = apiEndTime - apiStartTime;
        console.log(`API Response Zeit: ${apiResponseTime.toFixed(2)}ms`);
        
        if (response.ok) {
          // Performance Logging: JSON Parse Zeit messen
          const parseStartTime = performance.now();
          const data: OverpassResponse = await response.json();
          const parseEndTime = performance.now();
          const parseTime = parseEndTime - parseStartTime;
          console.log(`JSON Parse Zeit: ${parseTime.toFixed(2)}ms`);
          
          // Performance Logging: Warnung bei langsamen Anfragen
          if (apiResponseTime > 5000) {
            console.warn(`LANGSAME API-ANFRAGE: ${apiResponseTime.toFixed(2)}ms (über 5 Sekunden!)`);
          }
          
          console.log('Hauptsuche Response:', data);
          
          if (data.elements && data.elements.length > 0) {
            cafes = this.convertElements(data.elements, lat, lng);
            cafes = this.removeDuplicates(cafes);
            console.log(`Hauptsuche: ${cafes.length} Cafés gefunden`);
          } else if (data.remark && data.remark.includes('timeout')) {
            console.warn(' Hauptsuche-Timeout, verwende einfache Query...');
            // Fallback zu einfacher Query bei Timeout
            cafes = await this.performSimpleSearch(lat, lng, radiusKm, maxResults);
          }
        }
      } catch (error) {
        console.warn('Hauptsuche fehlgeschlagen, verwende einfache Query:', error);
        cafes = await this.performSimpleSearch(lat, lng, radiusKm, maxResults);
      }
      
      // Schritt 2: Erweiterte Suche wenn zu wenige Ergebnisse
      if (cafes.length < 3) {
        console.log('zu wenige Ergebnisse, starte erweiterte Suche...');
        cafes = await this.performFallbackSearch(lat, lng, radiusKm, maxResults, cafes);
      }
      
      // Nach Entfernung sortieren und begrenzen
      const sortedCafes = this.sortByDistance(cafes, lat, lng).slice(0, maxResults);
      
      // Performance Logging: Gesamtzeit berechnen und ausgeben
      const totalEndTime = performance.now();
      const totalTime = totalEndTime - totalStartTime;
      console.log(`Gesamtzeit der Cafe-Suche: ${totalTime.toFixed(2)}ms`);
      
      // Performance Logging: Warnung bei sehr langsamen Gesamtoperationen
      if (totalTime > 10000) {
        console.warn(`SEHR LANGSAME GESAMTOPERATION: ${totalTime.toFixed(2)}ms (über 10 Sekunden!)`);
      }
      
      console.log(`${sortedCafes.length} Cafés gefunden und sortiert`);
      return sortedCafes;
      
    } catch (error) {
      // Performance Logging: Gesamtzeit auch bei Fehler
      const totalEndTime = performance.now();
      const totalTime = totalEndTime - totalStartTime;
      console.log(`Gesamtzeit (mit Fehler): ${totalTime.toFixed(2)}ms`);
      
      console.error('Fehler beim Laden der Cafés:', error);
      throw new Error('Fehler beim Laden der Cafés in der Nähe');
    } finally {
      // WICHTIG: Rate Limiting Flag zurücksetzen
      this.isRequestInProgress = false;
    }
  }
  
  // Baut eine Adresse aus den OSM Tags zusammen
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
  
  // Sortiert Cafés nach Entfernung zum gegebenen Punkt
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
  
  // Berechnet die Luftlinien-Entfernung zwischen zwei Punkten (Haversine-Formel)
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
  
  // Konvertiert Grad in Radiant
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Convenience-Funktion für einfache Verwendung
export const loadNearbyCafes = async (
  lat: number,
  lng: number,
  radiusKm: number = 10,
  maxResults: number = 10
): Promise<NearbyCafe[]> => {
  return OverpassApiService.loadNearbyCafes(lat, lng, radiusKm, maxResults);
};
