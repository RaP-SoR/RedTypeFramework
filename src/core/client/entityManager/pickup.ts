import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityPickupData, IEntityMarkerData, IEntityLabelData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";
import { EntityMarker } from "./marker";
import { EntityTextLabel } from "./textlabel";

let createdPickups: Map<string, IEntity> = new Map();
let pickupHandles: Map<string, number> = new Map();
let pickupCooldowns: Map<string, number> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;
const PICKUP_CHECK_INTERVAL = 100;

export class EntityPickup {
  static create(entity: IEntity): number {
    entity.pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const data = entity.data as IEntityPickupData;

    if (!HasModelLoaded(data.model)) {
      RequestModel(data.model);
      let attempts = 0;
      while (!HasModelLoaded(data.model) && attempts < 100) {
        setTimeout(() => {}, 10);
        attempts++;
      }
    }

    const pickupHandle = CreatePickup(
      data.pickupHash || GetHashKey("PICKUP_CUSTOM_SCRIPT"),  // Pickup Hash
      entity.pos.x,                                           // Position X
      entity.pos.y,                                           // Position Y
      entity.pos.z,                                           // Position Z
      0,                                                      // Flags
      data.amount || 1,                                       // Amount
      false,                                                  // p6 (unknown)
      data.model,                                             // Model
    );

    if (pickupHandle && pickupHandle !== 0) {
      // Setze Rotation falls vorhanden
      if (entity.rot) {
        SetEntityRotation(pickupHandle, entity.rot.x, entity.rot.y, entity.rot.z, 2, false);
      }

      pickupHandles.set(entity.id, pickupHandle);
      createdPickups.set(entity.id, entity);

      if (data.showMarker && data.markerData) {
        const markerEntity: IEntity = {
          id: `${entity.id}_marker`,
          type: "marker",
          pos: entity.pos,
          streamDistance: entity.streamDistance,
          data: data.markerData
        };
        EntityMarker.add(markerEntity);
      }

      if (data.showTextLabel && data.textLabelData) {
        const textLabelEntity: IEntity = {
          id: `${entity.id}_textlabel`,
          type: "textlabel",
          pos: new CVector3(entity.pos.x, entity.pos.y, entity.pos.z + 0.5),
          streamDistance: entity.streamDistance,
          scale: entity.scale,
          data: data.textLabelData
        };
        EntityTextLabel.add(textLabelEntity);
      }

      console.log(`Created pickup ${pickupHandle} (model: ${data.model}) for entity ${entity.id}`);
      return pickupHandle;
    } else {
      console.error(`Failed to create pickup for entity ${entity.id} with model ${data.model}`);
      return 0;
    }
  }

  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreatePickup(entityWithPos);
  }

  static delete(id: string) {
    const pickupHandle = pickupHandles.get(id);
    if (pickupHandle && pickupHandle !== 0) {
      console.log(`Streaming OUT: Removing pickup ${pickupHandle} for entity ${id}`);
      RemovePickup(pickupHandle);
      pickupHandles.delete(id);
    }

    const pickup = createdPickups.get(id);
    if (pickup) {
      const data = pickup.data as IEntityPickupData;
      
      if (data.showMarker) {
        EntityMarker.remove(`${id}_marker`);
      }
      
      if (data.showTextLabel) {
        EntityTextLabel.remove(`${id}_textlabel`);
      }
    }

    createdPickups.delete(id);
    pickupCooldowns.delete(id);
  }

  static remove(id: string) {
    console.log(`PERMANENT: Removing pickup for entity ${id}`);
    this.delete(id);
  }

  static update(id: string) {
    const pickup = createdPickups.get(id);
    if (!pickup) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "pickup") return;
      
      this.remove(id);
      this.create(entity);
    } else {
      const pickupHandle = pickupHandles.get(id);
      if (pickupHandle && pickupHandle !== 0) {
        const updatedEntity = ClientEntityManager.getEntity(id);
        if (updatedEntity) {
          this.remove(id);
          this.create(updatedEntity);
        }
      }
    }
  }

  private static checkAndCreatePickup(pickup: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = pickup.pos.distanceTo(lastPlayerPos);
    if (
      !createdPickups.has(pickup.id) &&
      distance <= pickup.streamDistance
    ) {
      this.create(pickup);
    }
  }

  public static streamPickups() {
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

      const pickupsToRemove: string[] = [];
      const pickupsToCreate: IEntity[] = [];

      createdPickups.forEach((pickup, id) => {
        const distance = pickup.pos.distanceTo(playerPos);
        if (distance > pickup.streamDistance) {
          pickupsToRemove.push(id);
        }
      });

      const allPickups = ClientEntityManager.getEntitiesByType("pickup");
      allPickups.forEach((pickup) => {
        if (!createdPickups.has(pickup.id)) {
          const pickupPos = new CVector3(pickup.pos.x, pickup.pos.y, pickup.pos.z);
          const distance = pickupPos.distanceTo(playerPos);
          if (distance <= pickup.streamDistance) {
            const entityWithPos = { ...pickup, pos: pickupPos };
            pickupsToCreate.push(entityWithPos);
          }
        }
      });

      pickupsToRemove.forEach((id) => this.delete(id));
      pickupsToCreate.forEach((pickup) => this.create(pickup));

      console.log(
        `Pickups Streamed: Removed ${pickupsToRemove.length}, Created ${pickupsToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamPickups();
  }

  public static checkPickupInteractions() {
    const playerPed = PlayerPedId();
    const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, false);
    const playerPos = new CVector3(playerX, playerY, playerZ);

    createdPickups.forEach((pickup, id) => {
      const pickupHandle = pickupHandles.get(id);
      if (!pickupHandle || pickupHandle === 0) return;

      const data = pickup.data as IEntityPickupData;
      const distance = pickup.pos.distanceTo(playerPos);

      if (distance <= 2.0) {
        const cooldown = pickupCooldowns.get(id);
        const now = GetGameTimer();
        
        if (cooldown && now < cooldown) return;

        if (HasPickupBeenCollected(pickupHandle)) {
          this.onPickupCollected(id, pickup);
        }
      }
    });
  }

  private static onPickupCollected(id: string, pickup: IEntity) {
    const data = pickup.data as IEntityPickupData;
    
    console.log(`Pickup collected: ${id}`);

    if (data.playSound !== false) {
      const soundName = data.soundName || "PICK_UP";
      const soundSet = data.soundSet || "HUD_FRONTEND_DEFAULT_SOUNDSET";
      PlaySoundFrontend(-1, soundName, soundSet, true);
    }

    if (data.onPickup) {
      emit(data.onPickup, id, pickup, data.amount || 1);
    }

    if (data.respawnTime && data.respawnTime > 0) {
      const respawnTime = GetGameTimer() + data.respawnTime;
      pickupCooldowns.set(id, respawnTime);

      this.delete(id);

      setTimeout(() => {
        pickupCooldowns.delete(id);
        const entity = ClientEntityManager.getEntity(id);
        if (entity) {
          this.create(entity);
        }
      }, data.respawnTime);
    } else if (data.destroyOnPickup !== false) {
      this.remove(id);
    }
  }

  static getPickupHandle(id: string): number | undefined {
    return pickupHandles.get(id);
  }

  static getActivePickups(): Map<string, IEntity> {
    return new Map(createdPickups);
  }

  static getPickupById(id: string): IEntity | undefined {
    return createdPickups.get(id);
  }

  static isPickupOnCooldown(id: string): boolean {
    const cooldown = pickupCooldowns.get(id);
    return cooldown ? GetGameTimer() < cooldown : false;
  }

  static forceRespawnPickup(id: string) {
    pickupCooldowns.delete(id);
    const entity = ClientEntityManager.getEntity(id);
    if (entity) {
      this.remove(id);
      this.create(entity);
    }
  }
}

setInterval(() => {
  EntityPickup.streamPickups();
}, STREAM_INTERVAL);

setInterval(() => {
  EntityPickup.checkPickupInteractions();
}, PICKUP_CHECK_INTERVAL);

onNet("baseevents:enteredVehicle", () => {
  EntityPickup.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityPickup.forceStream();
});