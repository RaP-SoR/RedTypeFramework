import { CVector3 } from "../CVector3";

export type EntityType =
  | "blip"
  | "textlabel"
  | "marker"
  | "checkpoint"
  | "colshape"
  | "object"
  | "ped"
  | "pickup";

export interface IEntity {
  id: string;
  name?: string;
  pos: CVector3;
  rot?: CVector3;
  type: EntityType;
  streamDistance: number;
  dimension?: number;
  scale?: number;
  data?: Record<string, any>;
}

export interface IEntityLabelData {
  text: string;
  font?: number;
  color?: [number, number, number, number]; // R, G, B, A
  backgroundColor?: [number, number, number, number];
  drawBackground?: boolean;
}

// https://docs.fivem.net/docs/game-references/blips/
export interface IEntityBlipData {
  sprite: number;
  shortRange?: boolean;
  crew?: boolean;
  display?: number; // 0: Never, 1: Only if on screen, 2: Always
  color?: number; // Color ID
  alpha?: number;
}
// https://docs.fivem.net/docs/game-references/markers/
export interface IEntityMarkerData {
  type: number; // Marker type
  dirX?: number;
  dirY?: number;
  dirZ?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
  bobUpAndDown?: boolean;
  faceCamera?: boolean;
  rotate?: boolean;
  textureDict?: string;
  textureName?: string;
  drawOnEnts?: boolean;
}
// https://docs.fivem.net/docs/game-references/checkpoints/

export interface IEntityCheckpointData {
  type?: number; // Checkpoint type
  nextX?: number; // Next Position X
  nextY?: number; // Next Position Y
  nextZ?: number; // Next Position Z
  radius?: number; // Radius
  red?: number; // Red
  green?: number; // Green
  blue?: number; // Blue
  alpha?: number; // Alpha
  reserved?: number; // Reserved
  onEnter?: () => void; // On Enter event
  onExit?: () => void; // On Exit event
}

export interface IEntityColShapeData {
  shape: "sphere" | "box" | "cylinder" | "polygon";
  radius?: number; // Für sphere und cylinder
  width?: number; // Für box
  height?: number; // Für box und cylinder
  depth?: number; // Für box
  points?: CVector3[]; // Für polygon
  onEnter?: string; // Event name beim Betreten
  onExit?: string; // Event name beim Verlassen
  checkInterval?: number; // Wie oft prüfen (ms), default: 100

  // Optional: Marker hinzufügen
  showMarker?: boolean;
  markerData?: IEntityMarkerData;

  // Optional: TextLabel hinzufügen
  showTextLabel?: boolean;
  textLabelData?: IEntityLabelData;
}

export interface IEntityObjectData {
  model: string | number; // Model Hash oder Name
  isNetwork?: boolean; // Ist es ein Netzwerk-Objekt?
  netMissionEntity?: boolean; // Ist es ein Net Mission Entity?
  doorFlag?: boolean; // Ist es ein Tür-Flag?
  freezeWhenBagless?: boolean; // Soll es eingefroren werden, wenn es keine Tasche hat?
  collision?: boolean; // Soll Kollision aktiviert sein?

  dynamic?: boolean; // Soll es dynamisch sein?
  visible?: boolean; // Soll es sichtbar sein?
  invincible?: boolean; // Soll es unverwundbar sein?
  alpha?: number; // Alpha-Wert (Transparenz)
  textureVariation?: number; // Textur-Variation
  lodDistance?: number; // LOD Distanz
}

export interface IEntityPickupData {
  model: string | number;           // Model Hash oder Name
  pickupHash?: string | number;     // Pickup Hash (z.B. "PICKUP_MONEY")
  amount?: number;                  // Anzahl/Wert des Pickups
  respawnTime?: number;             // Respawn-Zeit in ms (0 = kein Respawn)
  destroyOnPickup?: boolean;        // Pickup nach Aufheben zerstören
  onPickup?: string;                // Event beim Aufheben
  
  // Optional: Marker/TextLabel für bessere Sichtbarkeit
  showMarker?: boolean;
  markerData?: IEntityMarkerData;
  showTextLabel?: boolean;
  textLabelData?: IEntityLabelData;
  
  // Pickup-Verhalten
  playSound?: boolean;              // Sound beim Aufheben
  soundName?: string;               // Custom Sound
  soundSet?: string;                // Sound Set
}
// Event Handler
export interface IEntityPedData {
  model: string | number; // Ped Model Hash oder Name
  isNetwork?: boolean; // Netzwerk-Ped
  thisScriptCheck?: boolean; // Script Check

  // Ped-Properties
  pedType?: number; // Ped Type (0-28)
  relationshipGroup?: string; // Relationship Group Hash
  invincible?: boolean; // Unverwundbar
  freezePosition?: boolean; // Position einfrieren
  blockEvents?: boolean; // Events blockieren
  canRagdoll?: boolean; // Ragdoll aktiviert

  // Verhalten
  taskSequence?: string; // Task Sequence
  scenario?: string; // Scenario (z.B. "WORLD_HUMAN_SMOKING")
  animation?: {
    // Animation
    dict: string;
    name: string;
    speed?: number;
    speedMultiplier?: number;
    duration?: number;
    flag?: number;
    playbackRate?: number;
  };

  //TODO: Player/Ped Outfit System
  // Erscheinung
  outfit?: {
    // Outfit-Components
    components?: Array<{
      componentId: number;
      drawableId: number;
      textureId: number;
    }>;
    props?: Array<{
      propId: number;
      drawableId: number;
      textureId: number;
    }>;
  };

  // Waffen
  weapons?: Array<{
    hash: string | number;
    ammo?: number;
    equipNow?: boolean;
    attachments?: string[];
  }>;

  // Verhalten
  blip?: {
    // Optional: Blip für Ped
    sprite: number;
    color?: number;
    scale?: number;
    name?: string;
  };

  // Interaktion
  canBeDamaged?: boolean; // Kann beschädigt werden
  canBeTargeted?: boolean; // Kann anvisiert werden
  hearingRange?: number; // Hörreichweite
  seeingRange?: number; // Sichtreichweite
  accuracy?: number; // Zielgenauigkeit

  // Events
  onInteract?: string; // Event beim Interagieren
  onDeath?: string; // Event beim Tod
  onDamage?: string; // Event bei Schaden
}
