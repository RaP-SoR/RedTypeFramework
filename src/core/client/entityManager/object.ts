import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityObjectData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdObjects: Map<string, IEntity> = new Map();
let objectHandles: Map<string, number> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityObject {
  static create(entity: IEntity): number {
    entity.pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const data = entity.data as IEntityObjectData;

    // Lade das Model falls nötig
    if (!HasModelLoaded(data.model)) {
      RequestModel(data.model);
      let attempts = 0;
      while (!HasModelLoaded(data.model) && attempts < 100) {
        setTimeout(() => {}, 10);
        attempts++;
      }
    }

    // Erstelle das Objekt
    const objectHandle = CreateObject(
      data.model, // Model Hash
      entity.pos.x, // Position X
      entity.pos.y, // Position Y
      entity.pos.z, // Position Z
      data.isNetwork || false, // Network Object
      data.netMissionEntity || false, // Net Mission Entity
      data.doorFlag || false // Door Flag
    );

    if (objectHandle && objectHandle !== 0) {
      // Setze Rotation falls vorhanden
      if (entity.rot) {
        SetEntityRotation(
          objectHandle,
          entity.rot.x,
          entity.rot.y,
          entity.rot.z,
          2,
          false
        );
      }

      // Weitere Objekt-Properties setzen
      if (data.freezeWhenBagless !== undefined) {
        FreezeEntityPosition(objectHandle, data.freezeWhenBagless);
      }

      if (data.collision !== undefined) {
        SetEntityCollision(objectHandle, data.collision, data.collision);
      }

      if (data.dynamic !== undefined) {
        SetEntityDynamic(objectHandle, data.dynamic);
      }

      if (data.visible !== undefined) {
        SetEntityVisible(objectHandle, data.visible, false);
      }

      if (data.invincible !== undefined) {
        SetEntityInvincible(objectHandle, data.invincible);
      }

      if (data.alpha !== undefined) {
        SetEntityAlpha(objectHandle, data.alpha, false);
      }

      if (data.lodDistance !== undefined) {
        SetEntityLodDist(objectHandle, data.lodDistance);
      }

      // Texture-Variation setzen
      if (data.textureVariation !== undefined) {
        SetObjectTextureVariation(objectHandle, data.textureVariation);
      }

      objectHandles.set(entity.id, objectHandle);
      createdObjects.set(entity.id, entity);

      console.log(
        `Created object ${objectHandle} (model: ${data.model}) for entity ${entity.id}`
      );
      return objectHandle;
    } else {
      console.error(
        `Failed to create object for entity ${entity.id} with model ${data.model}`
      );
      return 0;
    }
  }

  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreateObject(entityWithPos);
  }

  static delete(id: string) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      console.log(
        `Streaming OUT: Removing object ${objectHandle} for entity ${id}`
      );
      DeleteObject(objectHandle);
      objectHandles.delete(id);
    }
    createdObjects.delete(id);
  }

  static remove(id: string) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      console.log(
        `PERMANENT: Removing object ${objectHandle} for entity ${id}`
      );
      DeleteObject(objectHandle);
      objectHandles.delete(id);
    }
    createdObjects.delete(id);
  }

  static update(id: string) {
    const object = createdObjects.get(id);
    if (!object) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "object") return;

      this.remove(id);
      this.create(entity);
    } else {
      const objectHandle = objectHandles.get(id);
      if (objectHandle && objectHandle !== 0) {
        const updatedEntity = ClientEntityManager.getEntity(id);
        if (updatedEntity) {
          SetEntityCoords(
            objectHandle,
            updatedEntity.pos.x,
            updatedEntity.pos.y,
            updatedEntity.pos.z,
            false,
            false,
            false,
            false
          );

          if (updatedEntity.rot) {
            SetEntityRotation(
              objectHandle,
              updatedEntity.rot.x,
              updatedEntity.rot.y,
              updatedEntity.rot.z,
              2,
              false
            );
          }

          createdObjects.set(id, updatedEntity);
        }
      }
    }
  }

  private static checkAndCreateObject(object: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = object.pos.distanceTo(lastPlayerPos);
    if (!createdObjects.has(object.id) && distance <= object.streamDistance) {
      this.create(object);
    }
  }

  public static streamObjects() {
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

      const objectsToRemove: string[] = [];
      const objectsToCreate: IEntity[] = [];

      createdObjects.forEach((object, id) => {
        const distance = object.pos.distanceTo(playerPos);
        if (distance > object.streamDistance) {
          objectsToRemove.push(id);
        }
      });

      const allObjects = ClientEntityManager.getEntitiesByType("object");
      allObjects.forEach((object) => {
        if (!createdObjects.has(object.id)) {
          const objectPos = new CVector3(
            object.pos.x,
            object.pos.y,
            object.pos.z
          );
          const distance = objectPos.distanceTo(playerPos);
          if (distance <= object.streamDistance) {
            const entityWithPos = { ...object, pos: objectPos };
            objectsToCreate.push(entityWithPos);
          }
        }
      });

      objectsToRemove.forEach((id) => this.delete(id));
      objectsToCreate.forEach((object) => this.create(object));

      console.log(
        `Objects Streamed: Removed ${objectsToRemove.length}, Created ${objectsToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamObjects();
  }

  static getObjectHandle(id: string): number | undefined {
    return objectHandles.get(id);
  }

  static getActiveObjects(): Map<string, IEntity> {
    return new Map(createdObjects);
  }

  static getObjectById(id: string): IEntity | undefined {
    return createdObjects.get(id);
  }

  static setObjectPosition(id: string, pos: CVector3) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      SetEntityCoords(
        objectHandle,
        pos.x,
        pos.y,
        pos.z,
        false,
        false,
        false,
        false
      );

      const object = createdObjects.get(id);
      if (object) {
        object.pos = pos;
        createdObjects.set(id, object);
      }
    }
  }

  static setObjectRotation(id: string, rot: CVector3) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      SetEntityRotation(objectHandle, rot.x, rot.y, rot.z, 2, false);

      const object = createdObjects.get(id);
      if (object) {
        object.rot = rot;
        createdObjects.set(id, object);
      }
    }
  }

  static setObjectAlpha(id: string, alpha: number) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      SetEntityAlpha(objectHandle, alpha, false);
    }
  }

  static attachObjectToEntity(
    objectId: string,
    targetEntity: number,
    bone: number,
    offset: CVector3,
    rotation: CVector3
  ) {
    const objectHandle = objectHandles.get(objectId);
    if (objectHandle && objectHandle !== 0) {
      AttachEntityToEntity(
        objectHandle,
        targetEntity,
        bone,
        offset.x,
        offset.y,
        offset.z,
        rotation.x,
        rotation.y,
        rotation.z,
        false,
        false,
        false,
        false,
        2,
        true
      );
    }
  }

  static detachObject(id: string) {
    const objectHandle = objectHandles.get(id);
    if (objectHandle && objectHandle !== 0) {
      DetachEntity(objectHandle, true, false);
    }
  }
}

setInterval(() => {
  EntityObject.streamObjects();
}, STREAM_INTERVAL);

onNet("baseevents:enteredVehicle", () => {
  EntityObject.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityObject.forceStream();
});
