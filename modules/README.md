# Module Directory

Hier werden alle eigenen Module für das CTF-Core Framework entwickelt.

## Struktur

Module können zwei verschiedene Strukturen haben:

### Simple Struktur (für kleinere Module)
```
modules/
├── my-simple-module/
│   ├── server.ts          # Server-seitige Logik (erforderlich)
│   ├── client.ts          # Client-seitige Logik (optional)
│   ├── shared.ts          # Geteilte Types/Interfaces (optional)
│   ├── package.json       # Modul-Konfiguration
│   └── README.md          # Modul-Dokumentation
```

### Erweiterte Struktur (für komplexere Module)
```
modules/
├── my-complex-module/
│   ├── server/
│   │   ├── index.ts       # Server-Entry-Point
│   │   ├── handlers/      # Event-Handler
│   │   └── services/      # Business Logic
│   ├── client/
│   │   ├── index.ts       # Client-Entry-Point
│   │   ├── ui/            # UI-Components
│   │   └── handlers/      # Event-Handler
│   ├── shared/
│   │   ├── index.ts       # Shared-Entry-Point
│   │   ├── interfaces/    # TypeScript Interfaces
│   │   └── types/         # Type Definitions
│   ├── ui/                # Vue UI Components (optional)
│   │   ├── components/    # Vue Components
│   │   ├── views/         # Vue Views
│   │   └── index.ts       # UI-Entry-Point
│   ├── package.json       # Modul-Konfiguration
│   └── README.md          # Modul-Dokumentation
```

## Quick Start

1. Erstelle einen neuen Ordner für dein Modul
2. Wähle die passende Struktur (simple oder erweitert)
3. Implementiere deine Logik
4. Baue das Framework neu: `yarn build`

## Module deaktivieren

Um ein Modul temporär zu deaktivieren, ohne es zu löschen oder umzubenennen:

```bash
# Erstelle eine .ignore Datei im Modul-Ordner
touch modules/my-module/.ignore
```

Module mit einer `.ignore` Datei werden beim Build automatisch übersprungen. Das ist besonders nützlich für:
- Entwicklung und Testing
- Temporäre Deaktivierung
- Keine Git-Changes am Modulcode nötig

Um das Modul wieder zu aktivieren, lösche einfach die `.ignore` Datei:
```bash
rm modules/my-module/.ignore
```

## Build-System

Das Build-System erkennt automatisch die Modul-Struktur und:
- Kompiliert alle TypeScript-Dateien
- Führt Server/Client/Shared Code zusammen
- Integriert UI-Components in das Framework UI
- Erstellt optimierte Bundles

## Dokumentation

Siehe `FRAMEWORK_GUIDE.md` für detaillierte Informationen zur Modul-Entwicklung.
