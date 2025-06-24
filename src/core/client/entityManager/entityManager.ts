import { IEntity } from "@shared/interfaces/IEntity";
import { EntityBlip } from "./blip";
import { EVENTS } from "@shared/events/server";
import { CVector3 } from "@shared/CVector3";

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
    } else if (entity.type === "object") {
      emitNet("objectAdd", entity);
    } else if (entity.type === "marker") {
      emitNet("markerAdd", entity);
    } else if (entity.type === "label") {
      emitNet("textAdd", entity);
    }
  }

  static remove(id: string): void {
    if (!cliententities.has(id)) {
      throw new Error(`Entity with id ${id} does not exist.`);
    }
    cliententities.delete(id);
  }
  static update(entity: IEntity): void {
    if (!cliententities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} does not exist.`);
    }
    cliententities.set(entity.id, entity);
  }
  static getEntity(id: string): IEntity | undefined {
    return cliententities.get(id);
  }

  static getAllEntities(): Array<IEntity> {
    return Array.from(cliententities.values());
  }
  static getEntitiesByType(type: string): Array<IEntity> {
    return Array.from(cliententities.values()).filter(
      (entity) => entity.type === type
    );
  }
}

onNet(EVENTS.Entity.Add, ClientEntityManager.add);
onNet(EVENTS.Entity.Remove, ClientEntityManager.remove);
onNet(EVENTS.Entity.Update, ClientEntityManager.update);
