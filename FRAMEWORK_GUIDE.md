# CTF-Core Framework - Module Development Guide

## 🎯 Übersicht

Das CTF-Core Framework ist ein modulares TypeScript-Framework für FiveM/RedM Server-Entwicklung. Es bietet eine solide Grundlage für die Entwicklung eigener Module.

## 📁 Framework-Struktur

```
ctf-core/
├── src/core/                    # Framework Core
│   ├── client/                  # Client-seitige Core-Systeme
│   ├── server/                  # Server-seitige Core-Systeme
│   └── shared/                  # Geteilte Interfaces/Types
├── modules/                     # Deine eigenen Module hier
├── examples/                    # Beispiel-Module
├── cfx-ui/                     # UI-Framework (Vue 3 + Vuetify)
└── dist/                       # Kompilierte Ausgabe
```

## 🚀 Modul erstellen

### 1. Modul-Strukturen

Das Framework unterstützt zwei verschiedene Modul-Strukturen:

#### Simple Struktur (für kleinere Module)
```
modules/mein-modul/
├── server.ts                   # Server-Code (erforderlich)
├── client.ts                   # Client-Code (optional)
├── shared.ts                   # Geteilte Types (optional)
├── package.json                # Modul-Metadaten
└── README.md                   # Dokumentation
```

#### Erweiterte Struktur (für komplexere Module)
```
modules/mein-modul/
├── server/
│   ├── index.ts               # Server-Entry-Point
│   ├── handlers/              # Event-Handler
│   └── services/              # Business Logic
├── client/
│   ├── index.ts               # Client-Entry-Point
│   ├── ui/                    # UI-Components
│   └── handlers/              # Event-Handler
├── shared/
│   ├── index.ts               # Shared-Entry-Point
│   ├── interfaces/            # TypeScript Interfaces
│   └── types/                 # Type Definitions
├── ui/                        # Vue UI Components (optional)
│   ├── components/            # Vue Components
│   ├── views/                 # Vue Views
│   └── index.ts               # UI-Entry-Point
├── package.json               # Modul-Metadaten
└── README.md                  # Dokumentation
```

### 2. Build-System

Das erweiterte Build-System:
- Erkennt automatisch beide Modul-Strukturen
- Kompiliert alle TypeScript-Dateien zusammen
- Führt Core + Module in einheitliche Bundles zusammen
- Integriert UI-Components automatisch
- Unterstützt Hot-Reload während der Entwicklung

### 2. Modul Interface

Jedes Modul muss das `IModule` Interface implementieren:

```typescript
import { IModule, IModuleInfo } from "ctf-core/shared/interfaces/IModule";

export class MeinModul implements IModule {
  public info: IModuleInfo = {
    name: "mein-modul",
    version: "1.0.0",
    description: "Beschreibung meines Moduls",
    author: "Dein Name",
    dependencies: ["other-module"], // Optional
    requiredCoreVersion: "0.0.1"
  };

  public async onLoad(): Promise<void> {
    // Wird beim Laden aufgerufen
  }

  public async onStart(): Promise<void> {
    // Wird beim Starten aufgerufen
  }

  public async onStop(): Promise<void> {
    // Wird beim Stoppen aufgerufen
  }

  public async onUnload(): Promise<void> {
    // Wird beim Entladen aufgerufen
  }
}
```

### 3. Core-API Zugriff

```typescript
import { getCTFCore } from "ctf-core/server/CTFCore";

const core = getCTFCore();

// Zugriff auf Core-Systeme
const serverCore = core.getServerCore();
const entityManager = core.getEntityManager();
const dbFactory = core.getDatabaseFactory();

// Logging
core.log.info("Hello from module!");
core.log.error("Something went wrong!");
```

## 🔧 Verfügbare Core-Systeme

### Entity-Management
- **Blips**: Karten-Markierungen
- **Marker**: 3D-Marker in der Welt
- **Objects**: Weltgegenstände
- **Peds**: NPCs
- **ColShapes**: Kollisionsbereiche
- **Textlabels**: 3D-Text
- **Checkpoints**: Wegpunkte
- **Pickups**: Aufsammelbare Gegenstände

### Datenbank
- Abstrakte Datenbankschicht
- MongoDB-Provider (via cfx-mongodb)
- Repository-Pattern

### UI-System
- Vue 3 + Vuetify
- Dynamisches UI-Laden
- NUI-Integration

## 📝 Beispiele

### Entity erstellen
```typescript
const entityManager = core.getEntityManager();

// Blip erstellen
entityManager.add({
  id: "my-blip",
  type: "blip",
  pos: new CVector3(0, 0, 0),
  streamDistance: 1000,
  data: {
    sprite: 1,
    color: 2,
    shortRange: false
  }
});
```

### Datenbank verwenden
```typescript
const serverCore = core.getServerCore();
const dbProvider = serverCore.getDatabaseProvider();
const userRepo = dbProvider.getRepository<User>("users");

// Benutzer erstellen
const user = await userRepo.create({
  name: "TestUser",
  level: 1
});
```

### Commands registrieren
```typescript
RegisterCommand("mycommand", (source: number, args: string[]) => {
  core.log.info(`Command executed by ${source}`);
  emitNet("my:response", source, { success: true });
}, false);
```

## 🔄 Modul Lifecycle

1. **Load**: `onLoad()` - Ressourcen initialisieren
2. **Start**: `onStart()` - Events/Commands registrieren
3. **Running**: Modul ist aktiv
4. **Stop**: `onStop()` - Cleanup beginnen
5. **Unload**: `onUnload()` - Vollständiger Cleanup

## ⚙️ Build-System

```bash
# Core builden
yarn build:core

# UI builden  
yarn build:ui

# Alles builden
yarn build

# Development
yarn dev
```

### Module deaktivieren

Um ein Modul temporär zu deaktivieren ohne es zu löschen:

```bash
# .ignore Datei erstellen
touch modules/mein-modul/.ignore

# Modul wird beim nächsten Build übersprungen
yarn build
```

Die `.ignore` Datei bewirkt, dass das Modul beim Build-Prozess automatisch übersprungen wird. Das ist praktisch für:
- **Entwicklung**: Teste nur bestimmte Module
- **Debugging**: Isoliere Probleme
- **Deployment**: Deaktiviere unfertige Features
- **Git**: Keine Code-Changes nötig

Um das Modul wieder zu aktivieren:
```bash
rm modules/mein-modul/.ignore
```

## 🐛 Debugging

```typescript
// Debug-Modus prüfen
if (core.isDebugMode()) {
  core.log.info("Debug information");
}

// Framework-Version
const version = core.getVersion();
```

## 📚 Best Practices

1. **Modulnamen**: Verwende eindeutige Namen mit Namespace
2. **Dependencies**: Minimiere Abhängigkeiten zwischen Modulen
3. **Error Handling**: Verwende Try-Catch für kritische Operationen
4. **Cleanup**: Implementiere ordnungsgemäßen Cleanup in `onStop`/`onUnload`
5. **Logging**: Nutze das Framework-Logging-System

## 🔗 Weiterführende Links

- [FiveM Documentation](https://docs.fivem.net/)
- [Vue 3 Documentation](https://v3.vuejs.org/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
