// Zentrale Hilfsfunktionen für Spot-IDs um Konsistenz zu gewährleisten

export interface SpotIdentifier {
  osmType?: 'node' | 'way' | 'relation';
  osmId?: number;
  id?: number;
}

/**
 * Generiert eine konsistente Spot-ID im Format "osmType:osmId"
 * Dies ist das Format, das die Datenbank verwendet
 */
export const generateSpotId = (spot: SpotIdentifier): string => {
  // Debug-Logging
  console.log(`generateSpotId Input:`, spot);
  
  if (spot.osmType && spot.osmId) {
    const id = `${spot.osmType}:${spot.osmId}`;
    console.log(`generateSpotId Output: "${id}"`);
    return id;
  }
  
  // Fallback für Spots ohne OSM-Daten
  const fallbackId = `node:${spot.id || 'unknown'}`;
  console.log(`generateSpotId Fallback: "${fallbackId}"`);
  return fallbackId;
};


// Generiert Spot-Data für das Hinzufügen zu Favoriten

export const generateAddSpotData = (spot: any) => {
  const spotData = {
    osmType: spot.osmType || 'node',
    osmId: spot.osmId || spot.id,
    elementLat: spot.lat,
    elementLng: spot.lng,
    name: spot.name,
    amenity: spot.amenity || 'cafe',
    address: spot.address || '',
    tags: spot.tags || {}
  };
  
  console.log(`generateAddSpotData:`, spotData);
  return spotData;
};
