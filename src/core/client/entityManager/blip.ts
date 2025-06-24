import { CVector3 } from "@shared/CVector3";
import { IEntity } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdBlips: Map<string, IEntity> = new Map();
let blipIds: Map<string, number> = new Map();

let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityBlip {
  static create(entity: IEntity): number {
    entity.pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);

    const blipId = AddBlipForCoord(entity.pos.x, entity.pos.y, entity.pos.z);

    blipIds.set(entity.id, blipId);
    createdBlips.set(entity.id, entity);

    SetBlipSprite(blipId, entity.data?.sprite);
    SetBlipScale(blipId, entity.scale || 1.0);
    SetBlipAsShortRange(blipId, entity.data?.shortRange || true);
    SetBlipColour(blipId, entity.data?.color);
    SetBlipAlpha(blipId, entity.data?.alpha || 255);
    SetBlipCrew(blipId, entity.data?.crew || false);
    SetBlipDisplay(blipId, entity.data?.display || 2);

    return blipId;
  }

  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };

    this.checkAndCreateBlip(entityWithPos);
  }

  static delete(id: string) {
    const blipId = blipIds.get(id);
    if (blipId) {
      console.log(`Streaming OUT: Removing blip ${blipId} for entity ${id}`);
      RemoveBlip(blipId);
      blipIds.delete(id);
    }
    createdBlips.delete(id);
  }

  static remove(id: string) {
    const blipId = blipIds.get(id);
    if (blipId) {
      console.log(`PERMANENT: Removing blip ${blipId} for entity ${id}`);
      RemoveBlip(blipId);
      blipIds.delete(id);
    }
    createdBlips.delete(id);
  }

  static update(id: string) {
    const blipId = blipIds.get(id);

    let blip = createdBlips.get(id);
    if (!blip) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "blip") return;
      blip = entity;
    }

    if (blip && blipId) {
      console.log(`Updating blip ${blipId} for entity ${id}`);
      SetBlipSprite(blipId, blip.data?.sprite);
      SetBlipScale(blipId, blip.scale || 1.0);
      SetBlipAsShortRange(blipId, blip.data?.shortRange || true);
      SetBlipColour(blipId, blip.data?.color);
      SetBlipAlpha(blipId, blip.data?.alpha || 255);
      SetBlipCrew(blipId, blip.data?.crew || false);
      SetBlipDisplay(blipId, blip.data?.display || 2);

      createdBlips.set(id, blip);
    }
  }

  private static checkAndCreateBlip(blip: IEntity) {
    if (!lastPlayerPos) {
      // Wenn noch keine Position da ist, sofort Player-Position holen
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = blip.pos.distanceTo(lastPlayerPos);
    if (!createdBlips.has(blip.id) && distance <= blip.streamDistance) {
      this.create(blip);
    }
  }

  public static streamBlips() {
    if (isStreaming) return;
    isStreaming = true;

    try {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      const playerPos = new CVector3(x, y, z);

      if (
        lastPlayerPos &&
        lastPlayerPos.distanceTo(playerPos) < STREAM_DISTANCE_THRESHOLD
      ) {
        return;
      }

      lastPlayerPos = playerPos;

      const blipsToRemove: string[] = [];
      const blipsToCreate: IEntity[] = [];

      createdBlips.forEach((blip, id) => {
        const distance = blip.pos.distanceTo(playerPos);
        if (distance > blip.streamDistance) {
          blipsToRemove.push(id);
        }
      });

      const allBlips = ClientEntityManager.getEntitiesByType("blip");
      allBlips.forEach((blip) => {
        if (!createdBlips.has(blip.id)) {
          const blipPos = new CVector3(blip.pos.x, blip.pos.y, blip.pos.z);
          const distance = blipPos.distanceTo(playerPos);
          if (distance <= blip.streamDistance) {
            const entityWithPos = { ...blip, pos: blipPos };
            blipsToCreate.push(entityWithPos);
          }
        }
      });

      blipsToRemove.forEach((id) => this.delete(id));
      blipsToCreate.forEach((blip) => this.create(blip));

      console.log(
        `Streamed: Removed ${blipsToRemove.length}, Created ${blipsToCreate.length} blips`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamBlips();
  }
}

setInterval(() => {
  EntityBlip.streamBlips();
}, STREAM_INTERVAL);

onNet("baseevents:enteredVehicle", () => {
  EntityBlip.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityBlip.forceStream();
});
