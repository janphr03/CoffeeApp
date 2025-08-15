# CoffeeSpots API Documentation

Diese Dokumentation beschreibt die REST API der CoffeeSpots-Anwendung.

## 📋 Übersicht

Die CoffeeSpots API ermöglicht:
- ✅ Benutzerregistrierung und -authentifizierung
- ✅ Verwaltung von Coffee Spot Favoriten
- ✅ Abrufen von Beliebtheitsdaten für Spots
- ✅ Session-basierte Authentifizierung

## 📁 Dateien

- `openapi.yaml` - Vollständige OpenAPI 3.0 Spezifikation
- `README.md` - Diese Dokumentation

## 🔧 Tools & Integration

### Swagger UI
Die OpenAPI-Spezifikation kann mit verschiedenen Tools visualisiert werden:

```bash
# Mit npx (Node.js)
npx swagger-ui-serve docs/api/openapi.yaml

# Mit Docker
docker run -p 8080:8080 -v $(pwd)/docs/api:/usr/share/nginx/html/api swaggerapi/swagger-ui
```

### Postman
Die `openapi.yaml` kann direkt in Postman importiert werden:
1. Postman öffnen
2. Import → File → `openapi.yaml` auswählen
3. Collection wird automatisch generiert

### Code-Generierung
Mit OpenAPI Generator können Client-Libraries generiert werden:

```bash
# TypeScript Client
openapi-generator-cli generate -i docs/api/openapi.yaml -g typescript-axios -o client-sdk/

# Python Client  
openapi-generator-cli generate -i docs/api/openapi.yaml -g python -o python-client/
```

## 🚀 API-Endpunkte

### Authentication
- `POST /api/auth/register` - Benutzerregistrierung
- `POST /api/auth/login` - Benutzeranmeldung  
- `POST /api/auth/logout` - Benutzerabmeldung
- `GET /api/auth/me` - Aktuelle Benutzerinfo

### Spots (Coffee Favorites)
- `GET /api/spots` - Alle Favoriten des Benutzers
- `POST /api/spots` - Neuen Favorit hinzufügen
- `DELETE /api/spots/{spotId}` - Favorit entfernen
- `GET /api/spots/favorites-count/{spotId}` - Beliebtheits-Counter (öffentlich)

## 🔐 Authentifizierung

Die API verwendet Session-basierte Authentifizierung:

1. **Login**: `POST /api/auth/login` setzt Session-Cookie
2. **Geschützte Routen**: Cookie wird automatisch mitgeschickt
3. **Logout**: `POST /api/auth/logout` löscht Session

## 📊 Beispiel-Requests

### Registrierung
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "coffee_lover",
    "email": "user@example.com", 
    "password": "securePassword123"
  }'
```

### Favorit hinzufügen
```bash
curl -X POST http://localhost:5000/api/spots \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "osmType": "node",
    "osmId": "123456789",
    "elementLat": 52.5200,
    "elementLng": 13.4050,
    "name": "Café Central",
    "amenity": "cafe",
    "address": "Alexanderplatz 1, 10178 Berlin"
  }'
```

### Beliebtheits-Counter (keine Auth)
```bash
curl http://localhost:5000/api/spots/favorites-count/node:123456789
```

## 🏗️ Entwicklung

### Spezifikation validieren
```bash
# Mit swagger-parser
npx swagger-parser validate docs/api/openapi.yaml

# Mit spectral (erweiterte Validierung)
npx @stoplight/spectral-cli lint docs/api/openapi.yaml
```

### Spezifikation aktualisieren
1. `docs/api/openapi.yaml` bearbeiten
2. Änderungen validieren  
3. Tools/Client-Code neu generieren

## 📚 Weitere Ressourcen

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Postman OpenAPI Import](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
