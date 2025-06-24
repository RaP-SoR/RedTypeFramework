import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityPedData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdPeds: Map<string, IEntity> = new Map();
let pedHandles: Map<string, number> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityPed {
  static create(entity: IEntity): number {
    entity.pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const data = entity.data as IEntityPedData;

    if (!HasModelLoaded(data.model)) {
      RequestModel(data.model);
      let attempts = 0;
      while (!HasModelLoaded(data.model) && attempts < 100) {
        setTimeout(() => {}, 10);
        attempts++;
      }
    }

    // Erstelle den Ped
    const pedHandle = CreatePed(
      data.pedType || 4,                       // Ped Type (4 = Civilian)
      data.model,                              // Model Hash
      entity.pos.x,                            // Position X
      entity.pos.y,                            // Position Y
      entity.pos.z,                            // Position Z
      entity.rot?.z || 0.0,                    // Heading
      data.isNetwork || false,                 // Network Ped
      data.thisScriptCheck !== false           // This Script Check
    );

    if (pedHandle && pedHandle !== 0) {
      if (entity.rot) {
        SetEntityRotation(pedHandle, entity.rot.x, entity.rot.y, entity.rot.z, 2, false);
      }

      if (data.invincible !== undefined) {
        SetEntityInvincible(pedHandle, data.invincible);
      }

      if (data.freezePosition !== undefined) {
        FreezeEntityPosition(pedHandle, data.freezePosition);
      }

      if (data.blockEvents !== undefined) {
        SetBlockingOfNonTemporaryEvents(pedHandle, data.blockEvents);
      }

      if (data.canRagdoll !== undefined) {
        SetPedCanRagdoll(pedHandle, data.canRagdoll);
      }

      if (data.canBeDamaged !== undefined) {
        SetEntityCanBeDamaged(pedHandle, data.canBeDamaged);
      }

      if (data.canBeTargeted !== undefined) {
        SetEntityCanBeTargetedWithoutLos(pedHandle, data.canBeTargeted);
      }

      if (data.relationshipGroup) {
        SetPedRelationshipGroupHash(pedHandle, GetHashKey(data.relationshipGroup));
      }

      if (data.accuracy !== undefined) {
        SetPedAccuracy(pedHandle, data.accuracy);
      }

      if (data.hearingRange !== undefined) {
        SetPedHearingRange(pedHandle, data.hearingRange);
      }

      if (data.seeingRange !== undefined) {
        SetPedSeeingRange(pedHandle, data.seeingRange);
      }

      this.applyOutfit(pedHandle, data);

      this.giveWeapons(pedHandle, data);

      this.applyBehavior(pedHandle, data);

      if (data.blip) {
        this.createPedBlip(pedHandle, data.blip, entity.id);
      }

      pedHandles.set(entity.id, pedHandle);
      createdPeds.set(entity.id, entity);

      console.log(`Created ped ${pedHandle} (model: ${data.model}) for entity ${entity.id}`);
      return pedHandle;
    } else {
      console.error(`Failed to create ped for entity ${entity.id} with model ${data.model}`);
      return 0;
    }
  }

  private static applyOutfit(pedHandle: number, data: IEntityPedData) {
    if (data.outfit) {
      if (data.outfit.components) {
        data.outfit.components.forEach(component => {
          SetPedComponentVariation(
            pedHandle,
            component.componentId,
            component.drawableId,
            component.textureId,
            2
          );
        });
      }

      if (data.outfit.props) {
        data.outfit.props.forEach(prop => {
          SetPedPropIndex(
            pedHandle,
            prop.propId,
            prop.drawableId,
            prop.textureId,
            true
          );
        });
      }
    }
  }

  private static giveWeapons(pedHandle: number, data: IEntityPedData) {
    if (data.weapons) {
      data.weapons.forEach(weapon => {
        const weaponHash = typeof weapon.hash === 'string' ? GetHashKey(weapon.hash) : weapon.hash;
        GiveWeaponToPed(pedHandle, weaponHash, weapon.ammo || 250, false, weapon.equipNow || false);

        if (weapon.attachments) {
          weapon.attachments.forEach(attachment => {
            const attachmentHash = typeof attachment === 'string' ? GetHashKey(attachment) : attachment;
            GiveWeaponComponentToPed(pedHandle, weaponHash, attachmentHash);
          });
        }
      });
    }
  }

  private static applyBehavior(pedHandle: number, data: IEntityPedData) {
    if (data.taskSequence) {
      console.log(`Applying task sequence: ${data.taskSequence}`);
    }

    if (data.scenario) {
      TaskStartScenarioInPlace(pedHandle, data.scenario, 0, true);
    }

    if (data.animation) {
      const anim = data.animation;
      
      if (!HasAnimDictLoaded(anim.dict)) {
        RequestAnimDict(anim.dict);
        let attempts = 0;
        while (!HasAnimDictLoaded(anim.dict) && attempts < 100) {
          setTimeout(() => {}, 10);
          attempts++;
        }
      }

      TaskPlayAnim(
        pedHandle,
        anim.dict,
        anim.name,
        anim.speed || 8.0,
        anim.speedMultiplier || -8.0,
        anim.duration || -1,
        anim.flag || 1,
        anim.playbackRate || 0.0,
        false,
        false,
        false
      );
    }
  }

  private static createPedBlip(pedHandle: number, blipData: any, entityId: string) {
    const blipId = AddBlipForEntity(pedHandle);
    SetBlipSprite(blipId, blipData.sprite);
    SetBlipColour(blipId, blipData.color || 1);
    SetBlipScale(blipId, blipData.scale || 1.0);
    
    if (blipData.name) {
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString(blipData.name);
      EndTextCommandSetBlipName(blipId);
    }
  }

  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreatePed(entityWithPos);
  }

  static delete(id: string) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      console.log(`Streaming OUT: Removing ped ${pedHandle} for entity ${id}`);
      DeletePed(pedHandle);
      pedHandles.delete(id);
    }
    createdPeds.delete(id);
  }

  static remove(id: string) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      console.log(`PERMANENT: Removing ped ${pedHandle} for entity ${id}`);
      DeletePed(pedHandle);
      pedHandles.delete(id);
    }
    createdPeds.delete(id);
  }

  static update(id: string) {
    const ped = createdPeds.get(id);
    if (!ped) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "ped") return;
      
      this.remove(id);
      this.create(entity);
    } else {
      const pedHandle = pedHandles.get(id);
      if (pedHandle && pedHandle !== 0) {
        const updatedEntity = ClientEntityManager.getEntity(id);
        if (updatedEntity) {
          SetEntityCoords(pedHandle, updatedEntity.pos.x, updatedEntity.pos.y, updatedEntity.pos.z, false, false, false, false);
          
          if (updatedEntity.rot) {
            SetEntityRotation(pedHandle, updatedEntity.rot.x, updatedEntity.rot.y, updatedEntity.rot.z, 2, false);
          }
          
          createdPeds.set(id, updatedEntity);
        }
      }
    }
  }

  private static checkAndCreatePed(ped: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = ped.pos.distanceTo(lastPlayerPos);
    if (
      !createdPeds.has(ped.id) &&
      distance <= ped.streamDistance
    ) {
      this.create(ped);
    }
  }

  public static streamPeds() {
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

      const pedsToRemove: string[] = [];
      const pedsToCreate: IEntity[] = [];

      createdPeds.forEach((ped, id) => {
        const distance = ped.pos.distanceTo(playerPos);
        if (distance > ped.streamDistance) {
          pedsToRemove.push(id);
        }
      });

      const allPeds = ClientEntityManager.getEntitiesByType("ped");
      allPeds.forEach((ped) => {
        if (!createdPeds.has(ped.id)) {
          const pedPos = new CVector3(ped.pos.x, ped.pos.y, ped.pos.z);
          const distance = pedPos.distanceTo(playerPos);
          if (distance <= ped.streamDistance) {
            const entityWithPos = { ...ped, pos: pedPos };
            pedsToCreate.push(entityWithPos);
          }
        }
      });

      pedsToRemove.forEach((id) => this.delete(id));
      pedsToCreate.forEach((ped) => this.create(ped));

      console.log(
        `Peds Streamed: Removed ${pedsToRemove.length}, Created ${pedsToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamPeds();
  }

  static getPedHandle(id: string): number | undefined {
    return pedHandles.get(id);
  }

  static getActivePeds(): Map<string, IEntity> {
    return new Map(createdPeds);
  }

  static getPedById(id: string): IEntity | undefined {
    return createdPeds.get(id);
  }

  static setPedPosition(id: string, pos: CVector3) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      SetEntityCoords(pedHandle, pos.x, pos.y, pos.z, false, false, false, false);
    }
  }

  static setPedHeading(id: string, heading: number) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      SetEntityHeading(pedHandle, heading);
    }
  }

  static makePedWalkTo(id: string, targetPos: CVector3, speed: number = 1.0) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      TaskGoStraightToCoord(pedHandle, targetPos.x, targetPos.y, targetPos.z, speed, -1, 0.0, 0.0);
    }
  }

  static makePedPlayAnimation(id: string, dict: string, name: string) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      if (!HasAnimDictLoaded(dict)) {
        RequestAnimDict(dict);
        let attempts = 0;
        while (!HasAnimDictLoaded(dict) && attempts < 100) {
          setTimeout(() => {}, 10);
          attempts++;
        }
      }
      TaskPlayAnim(pedHandle, dict, name, 8.0, -8.0, -1, 1, 0.0, false, false, false);
    }
  }

  static isPedDead(id: string): boolean {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      return IsPedDeadOrDying(pedHandle, true);
    }
    return false;
  }

  static getPedHealth(id: string): number {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      return GetEntityHealth(pedHandle);
    }
    return 0;
  }

  static setPedHealth(id: string, health: number) {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      SetEntityHealth(pedHandle, health);
    }
  }
}

// Streaming Timer
setInterval(() => {
  EntityPed.streamPeds();
}, STREAM_INTERVAL);

// Event Handler
onNet("baseevents:enteredVehicle", () => {
  EntityPed.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityPed.forceStream();
});

// Ped Interaction Handler
setTick(() => {
  const playerPed = PlayerPedId();
  const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, false);
  const playerPos = new CVector3(playerX, playerY, playerZ);

  createdPeds.forEach((ped, id) => {
    const pedHandle = pedHandles.get(id);
    if (pedHandle && pedHandle !== 0) {
      const data = ped.data as IEntityPedData;
      const distance = ped.pos.distanceTo(playerPos);

      // Interaktion prüfen
      if (distance <= 2.0 && data.onInteract) {
        // Zeige Interaktions-Prompt
        if (IsControlJustPressed(0, 51)) { // E Key
          emit(data.onInteract, id, ped);
        }
      }

      // Death Event
      if (data.onDeath && IsPedDeadOrDying(pedHandle, true)) {
        emit(data.onDeath, id, ped);
      }
    }
  });
});