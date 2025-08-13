// Service für das Parsing und Bewerten von Öffnungszeiten
export interface OpeningHoursStatus {
  isOpen: boolean;
  status: 'open' | 'closed' | 'unknown';
  statusText: string;
}

export class OpeningHoursService {
  // **MEMOIZATION: Cache für geparste Öffnungszeiten**
  private static openingHoursCache = new Map<string, { [day: number]: { start: number, end: number }[] }>();
  private static cacheExpiration = new Map<string, number>();
  private static readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 Minuten Cache

  /**
   * Hauptfunktion: Bestimmt den aktuellen Öffnungsstatus
   */
  public static evaluateOpeningHours(openingHours?: string): OpeningHoursStatus {
    if (!openingHours) {
      return {
        isOpen: true, // Default für unbekannte Öffnungszeiten
        status: 'unknown',
        statusText: 'Öffnungszeiten nicht verfügbar'
      };
    }

    try {
      //console.log('🕒 Parsing Öffnungszeiten:', openingHours); // Debug-Ausgabe
      
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sonntag, 1 = Montag, etc.
      const currentTime = now.getHours() * 100 + now.getMinutes(); // Format: HHMM

      // Spezialfall: 24/7
      if (this.is24_7(openingHours)) {
        return {
          isOpen: true,
          status: 'open',
          statusText: 'Geöffnet'
        };
      }

      // **MEMOIZATION: Parse die Öffnungszeiten mit Cache**
      const dayHours = this.parseOpeningHoursWithCache(openingHours);
      //console.log('📅 Geparste Tage:', dayHours); // Debug-Ausgabe
      const todaysHours = dayHours[currentDay];
      //console.log(`📍 Heute (Tag ${currentDay}):`, todaysHours, 'Aktuelle Zeit:', currentTime); // Debug-Ausgabe

      if (!todaysHours) {
        return {
          isOpen: false,
          status: 'closed',
          statusText: 'Geschlossen'
        };
      }

      // Prüfe ob aktuell geöffnet
      const isCurrentlyOpen = this.isTimeInRange(currentTime, todaysHours);

      return {
        isOpen: isCurrentlyOpen,
        status: isCurrentlyOpen ? 'open' : 'closed',
        statusText: isCurrentlyOpen ? 'Geöffnet' : 'Geschlossen'
      };

    } catch (error) {
      console.warn('Fehler beim Parsen der Öffnungszeiten:', openingHours, error);
      return {
        isOpen: true, // Im Zweifel optimistisch
        status: 'unknown',
        statusText: 'Öffnungszeiten nicht verfügbar'
      };
    }
  }

  /**
   * Prüft ob es sich um 24/7 handelt
   */
  private static is24_7(openingHours: string): boolean {
    const normalized = openingHours.toLowerCase().replace(/\s/g, '');
    return normalized.includes('24/7') || 
           normalized.includes('24h') ||
           normalized === 'mo-su00:00-24:00';
  }

  /**
   * **MEMOIZATION: Parse Öffnungszeiten mit Cache**
   */
  private static parseOpeningHoursWithCache(openingHours: string): { [day: number]: { start: number, end: number }[] } {
    const now = Date.now();
    
    // Cache bereinigen: Entferne abgelaufene Einträge
    this.cacheExpiration.forEach((expiration, key) => {
      if (now > expiration) {
        this.openingHoursCache.delete(key);
        this.cacheExpiration.delete(key);
      }
    });
    
    // Prüfe ob bereits im Cache
    if (this.openingHoursCache.has(openingHours)) {
      const expiration = this.cacheExpiration.get(openingHours);
      if (expiration && now < expiration) {
        console.log('📊 Öffnungszeiten aus Cache geladen für:', openingHours.substring(0, 30) + '...');
        return this.openingHoursCache.get(openingHours)!;
      }
    }
    
    // **PERFORMANCE LOGGING: Parsing-Zeit messen**
    const parseStartTime = performance.now();
    
    // Nicht im Cache oder abgelaufen: Neu parsen
    const result = this.parseOpeningHours(openingHours);
    
    // **PERFORMANCE LOGGING: Parsing-Zeit**
    const parseEndTime = performance.now();
    const parseTime = parseEndTime - parseStartTime;
    console.log(`📊 Öffnungszeiten Parsing Zeit: ${parseTime.toFixed(2)}ms für "${openingHours.substring(0, 30)}..."`);
    
    // **PERFORMANCE LOGGING: Warnung bei langsamen Parsing**
    if (parseTime > 10) {
      console.warn(`⚠️ LANGSAMES ÖFFNUNGSZEITEN-PARSING: ${parseTime.toFixed(2)}ms (über 10ms!)`);
    }
    
    // In Cache speichern
    this.openingHoursCache.set(openingHours, result);
    this.cacheExpiration.set(openingHours, now + this.CACHE_DURATION_MS);
    
    console.log(`📊 Öffnungszeiten in Cache gespeichert. Cache-Größe: ${this.openingHoursCache.size}`);
    
    return result;
  }

  /**
   * Parst Öffnungszeiten in strukturiertes Format
   * Unterstützt Formate wie:
   * - "Mo-Fr 08:00-18:00; Sa 09:00-17:00"
   * - "Mo-Su 06:00-22:00"
   * - "Tu-Sa 07:30-19:00"
   * - "Mo-Sa 08:00-12:00, Tu-Fr 14:00-18:00" (mehrere Zeiten pro Tag)
   * - "Feb-Mar: Mo-Su 10:00-19:00; Apr-Sep: Mo-Su 10:00-21:00" (Monate)
   */
  private static parseOpeningHours(openingHours: string): { [day: number]: { start: number, end: number }[] } {
    const result: { [day: number]: { start: number, end: number }[] } = {};
    
    // Erst prüfen ob es monatsbasierte Öffnungszeiten gibt
    if (this.hasMonthBasedHours(openingHours)) {
      const currentMonthHours = this.extractCurrentMonthHours(openingHours);
      if (currentMonthHours) {
        return this.parseOpeningHours(currentMonthHours);
      }
      // Fallback: wenn aktueller Monat nicht gefunden, als unbekannt markieren
      return {};
    }
    
    // Teile verschiedene Zeitbereiche (getrennt durch Semikolon)
    const parts = openingHours.split(';').map(part => part.trim());
    
    for (const part of parts) {
      if (!part) continue;
      
      // Parse jeden Teil - dieser kann mehrere Einträge haben
      this.parseComplexDayGroup(part, result);
    }
    
    return result;
  }

  /**
   * Prüft ob die Öffnungszeiten monatsbasiert sind
   */
  private static hasMonthBasedHours(openingHours: string): boolean {
    const monthPattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
    return monthPattern.test(openingHours);
  }

  /**
   * Extrahiert die Öffnungszeiten für den aktuellen Monat
   */
  private static extractCurrentMonthHours(openingHours: string): string | null {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    // Teile nach Semikolon und suche den passenden Monatsbereich
    const parts = openingHours.split(';').map(part => part.trim());
    
    for (const part of parts) {
      if (part.toLowerCase().includes('off') && this.monthRangeIncludes(part, currentMonth)) {
        return null; // Geschlossen in diesem Monat
      }
      
      if (this.monthRangeIncludes(part, currentMonth)) {
        // Extrahiere den Teil nach dem Doppelpunkt
        const colonIndex = part.indexOf(':');
        if (colonIndex !== -1) {
          return part.substring(colonIndex + 1).trim();
        }
      }
    }
    
    return null;
  }

  /**
   * Prüft ob ein Monatsbereich den aktuellen Monat einschließt
   */
  private static monthRangeIncludes(part: string, currentMonth: number): boolean {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const partLower = part.toLowerCase();
    
    // Suche nach Monatsbereich wie "Feb-Mar" oder einzelnem Monat "Dec"
    const rangeMatch = partLower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))?/);
    
    if (!rangeMatch) return false;
    
    const startMonth = monthNames.indexOf(rangeMatch[1]);
    const endMonth = rangeMatch[2] ? monthNames.indexOf(rangeMatch[2]) : startMonth;
    
    if (startMonth <= endMonth) {
      return currentMonth >= startMonth && currentMonth <= endMonth;
    } else {
      // Jahresübergreifend (z.B. Dec-Feb)
      return currentMonth >= startMonth || currentMonth <= endMonth;
    }
  }

  /**
   * Parst komplexe Tages-Gruppen mit mehreren Zeiträumen
   * z.B. "Mo-Sa 08:00-12:00, Tu-Fr 14:00-18:00, Su 08:00-11:00,13:30-17:00"
   */
  private static parseComplexDayGroup(part: string, result: { [day: number]: { start: number, end: number }[] }): void {
    // Intelligente Aufspaltung: berücksichtige dass Kommas sowohl Zeiträume als auch Zeit-Slots trennen können
    const segments = this.smartSplitByComma(part);
    
    for (const segment of segments) {
      this.parseSingleTimeSlot(segment.trim(), result);
    }
  }

  /**
   * Intelligente Aufspaltung am Komma - berücksichtigt dass es sowohl 
   * verschiedene Tagesgruppen als auch mehrere Zeiten für einen Tag trennen kann
   */
  private static smartSplitByComma(text: string): string[] {
    const segments: string[] = [];
    let currentSegment = '';
    let lastWasDays = false;
    
    const parts = text.split(',').map(p => p.trim());
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Prüfe ob dieser Teil Tage enthält (Mo, Tu, etc.)
      const hasDays = /\b(mo|tu|we|th|fr|sa|su)\b/i.test(part);
      
      if (hasDays) {
        // Neuer Tages-Block beginnt
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = part;
        lastWasDays = true;
      } else {
        // Keine Tage -> muss eine weitere Zeit für den vorherigen Block sein
        if (lastWasDays && currentSegment) {
          currentSegment += ', ' + part;
        } else {
          // Fallback: als separates Segment behandeln
          if (currentSegment) {
            segments.push(currentSegment);
          }
          currentSegment = part;
        }
        lastWasDays = false;
      }
    }
    
    if (currentSegment) {
      segments.push(currentSegment);
    }
    
    return segments;
  }

  /**
   * Parst einen einzelnen Zeit-Slot wie "Mo-Fr 08:00-18:00" oder "Su 08:00-11:00,13:30-17:00"
   */
  private static parseSingleTimeSlot(segment: string, result: { [day: number]: { start: number, end: number }[] }): void {
    // Regex für Tage am Anfang
    const dayMatch = segment.match(/^([A-Za-z,\-\s]+)\s+(.+)$/);
    if (!dayMatch) return;
    
    const [, daysPart, timesPart] = dayMatch;
    const days = this.parseDays(daysPart);
    
    // Parse alle Zeiträume für diese Tage (getrennt durch Komma)
    const timeRanges = timesPart.split(',').map(t => t.trim());
    
    for (const timeRange of timeRanges) {
      const timeMatch = timeRange.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
      if (!timeMatch) continue;
      
      const [, startTime, endTime] = timeMatch;
      const start = this.timeToMinutes(startTime);
      const end = this.timeToMinutes(endTime);
      
      // Handle overnight hours (end < start)
      const range = { start, end: end < start ? end + 2400 : end };
      
      for (const day of days) {
        if (!result[day]) result[day] = [];
        result[day].push(range);
      }
    }
  }

  /**
   * Parst Tage-Strings wie "Mo-Fr", "Sa", "Mo,We,Fr"
   */
  private static parseDays(daysString: string): number[] {
    const dayMap: { [key: string]: number } = {
      'mo': 1, 'monday': 1,
      'tu': 2, 'tuesday': 2,
      'we': 3, 'wednesday': 3,
      'th': 4, 'thursday': 4,
      'fr': 5, 'friday': 5,
      'sa': 6, 'saturday': 6,
      'su': 0, 'sunday': 0
    };

    const normalized = daysString.toLowerCase().replace(/\s/g, '');
    const days: number[] = [];

    // Handle Bereiche wie "mo-fr"
    const rangeMatch = normalized.match(/^([a-z]{2})-([a-z]{2})$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const startDay = dayMap[start];
      const endDay = dayMap[end];
      
      if (startDay !== undefined && endDay !== undefined) {
        if (startDay <= endDay) {
          for (let i = startDay; i <= endDay; i++) {
            days.push(i);
          }
        } else {
          // Wrap around (z.B. Fr-Mo)
          for (let i = startDay; i <= 6; i++) days.push(i);
          for (let i = 0; i <= endDay; i++) days.push(i);
        }
      }
      return days;
    }

    // Handle Komma-getrennte Liste wie "mo,we,fr"
    const dayList = normalized.split(',');
    for (const day of dayList) {
      const dayNum = dayMap[day.trim()];
      if (dayNum !== undefined) {
        days.push(dayNum);
      }
    }

    return days;
  }

  /**
   * Konvertiert Zeit-String zu Minuten (HHMM Format)
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Prüft ob eine Zeit in einem Zeitbereich liegt
   */
  private static isTimeInRange(currentTime: number, ranges: { start: number, end: number }[]): boolean {
    for (const range of ranges) {
      if (range.end > 2400) {
        // Overnight hours
        if (currentTime >= range.start || currentTime <= (range.end - 2400)) {
          return true;
        }
      } else {
        // Normal hours
        if (currentTime >= range.start && currentTime <= range.end) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * **MEMOIZATION: Cache zurücksetzen (für Debugging)**
   */
  public static clearOpeningHoursCache(): void {
    this.openingHoursCache.clear();
    this.cacheExpiration.clear();
    console.log('📊 Öffnungszeiten-Cache wurde geleert');
  }

  /**
   * **MEMOIZATION: Cache-Statistiken anzeigen**
   */
  public static getCacheStats(): { size: number, entries: string[] } {
    const entries: string[] = [];
    this.openingHoursCache.forEach((_, key) => {
      entries.push(key.substring(0, 50) + (key.length > 50 ? '...' : ''));
    });
    
    return {
      size: this.openingHoursCache.size,
      entries
    };
  }
}
