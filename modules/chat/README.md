# Example Complex Module

Ein Beispiel für ein komplexes CTF-Framework Modul mit vollständiger Server/Client/Shared/UI Struktur.

## Features

- ✅ Server-seitige Benutzer-Verwaltung
- ✅ Client-seitige Event-Behandlung  
- ✅ Geteilte TypeScript-Interfaces
- ✅ Vue.js UI-Komponenten
- ✅ Vollständige Typ-Sicherheit

## Struktur

```
example-complex/
├── server/
│   └── index.ts          # Server-Modul mit Benutzer-Management
├── client/
│   └── index.ts          # Client-Modul mit Event-Handling
├── shared/
│   └── index.ts          # Geteilte Types und Konstanten
├── ui/
│   ├── ExamplePanel.vue  # Vue UI-Komponente
│   └── index.ts          # UI-Export
├── package.json          # Modul-Konfiguration
└── README.md            # Diese Datei
```

## Verwendung

Das Modul wird automatisch vom Framework-Build-System erkannt und kompiliert. Nach dem Build sind folgende Commands verfügbar:

### Server Commands
- `/example:users` - Zeige aktuelle Benutzer-Liste
- `/example:config` - Zeige Modul-Konfiguration

### Client Commands  
- `/example:list` - Zeige Benutzer mit Benachrichtigungen
- `/example:ui` - Öffne die UI-Komponente

## Events

Das Modul verwendet folgende Events:
- `example:user:join` - Benutzer betritt Server
- `example:user:leave` - Benutzer verlässt Server  
- `example:user:action` - Benutzer-Aktion
- `example:config:update` - Konfiguration aktualisiert

## UI Integration

Die UI-Komponente zeigt:
- Liste aller online Benutzer
- Benutzer-Statistiken
- Level-basierte Farbkodierung
- Export-Funktionalität

## Anpassung

Dieses Beispiel kann als Template für eigene Module verwendet werden:

1. Kopiere den `example-complex` Ordner
2. Benenne ihn um (z.B. `my-module`)
3. Aktualisiere `package.json` mit deinen Informationen
4. Implementiere deine eigene Logik
5. Führe `yarn build` aus
