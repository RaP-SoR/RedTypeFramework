import { EntityType, IEntity } from "@shared/interfaces/IEntity";
import { EVENTS } from "@shared/events/server";
import { EntityBlip } from "./blip";
import { EntityTextLabel } from "./textlabel";
import { EntityMarker } from "./marker";
import { EntityCheckpoint } from "./checkpoints";
import { EntityColShape } from "./colshape";
import { EntityObject } from "./object";
import { EntityPed } from "./ped";
import { EntityPickup } from "./pickup";

let cliententities: Map<string, IEntity> = new Map();
export class ClientEntityManager {
  static add(entity: IEntity): void {
    console.log(
      `[ClientEntityManager-Add]Adding entity: ${JSON.stringify(entity)}`
    );
    if (cliententities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} already exists.`);
    }
    cliententities.set(entity.id, entity);
    if (entity.type === "blip") {
      EntityBlip.add(entity);
    } else if (entity.type === "textlabel") {
      EntityTextLabel.add(entity);
    } else if (entity.type === "marker") {
      EntityMarker.add(entity);
    } else if (entity.type === "checkpoint") {
      EntityCheckpoint.add(entity);
    } else if (entity.type === "object") {
      EntityObject.add(entity);
    } else if (entity.type === "colshape") {
      EntityColShape.add(entity);
    } else if (entity.type === "pickup") {
      EntityPickup.add(entity);
    } else if (entity.type === "ped") {
      EntityPed.add(entity);
    } else {
      console.warn(
        `[ClientEntityManager-Add] Unsupported entity type: ${entity.type}`
      );
    }
  }

  static remove(id: string): void {
    const entity = cliententities.get(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} does not exist.`);
    }
    
    // Entferne aus cliententities ZUERST
    cliententities.delete(id);
    if (entity.type === "blip") {
      EntityBlip.remove(id);
    }
    if (entity.type === "textlabel") {
      EntityTextLabel.remove(id);
    }
    if (entity.type === "marker") {
      EntityMarker.remove(id);
    }
    if (entity.type === "checkpoint") {
      EntityCheckpoint.remove(id);
    }
    if (entity.type === "colshape") {
      EntityColShape.remove(id);
    }
    if (entity.type === "object") {
      EntityObject.remove(id);
    }
    if (entity.type === "ped") {
      EntityPed.remove(id);
    }
    if (entity.type === "pickup") {
      EntityPickup.remove(id);
    }
  }
  static update(entity: IEntity): void {
    if (!cliententities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} does not exist.`);
    }
    cliententities.set(entity.id, entity);
    if (entity.type === "blip") {
      EntityBlip.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "textlabel") {
      EntityTextLabel.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "marker") {
      EntityMarker.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "checkpoint") {
      EntityCheckpoint.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "colshape") {
      EntityColShape.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "object") {
      EntityObject.update(entity.id);
    }
    if (cliententities.get(entity.id)?.type === "ped") {
      EntityPed.update(entity.id);
    }
  }
  static getEntity(id: string): IEntity | undefined {
    return cliententities.get(id);
  }

  static getAllEntities(): Array<IEntity> {
    return Array.from(cliententities.values());
  }
  static getEntitiesByType(type: EntityType): Array<IEntity> {
    return Array.from(cliententities.values()).filter(
      (entity) => entity.type === type
    );
  }
}

onNet(EVENTS.Entity.Add, ClientEntityManager.add);
onNet(EVENTS.Entity.Remove, ClientEntityManager.remove);
onNet(EVENTS.Entity.Update, ClientEntityManager.update);
