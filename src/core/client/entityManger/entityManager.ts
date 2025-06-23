import { IEntity } from "@shared/interfaces/IEntity";
import { EntityBlip } from "./blip";
import { EVENTS } from "@shared/events/server";

export class ClientEntityManager {
  private cliententities: Map<string, IEntity> = new Map();

  add(entity: IEntity): void {
    if (this.cliententities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} already exists.`);
    }
    this.cliententities.set(entity.id, entity);
    if (entity.type === "blip") {
      EntityBlip.create(entity);
    } else if (entity.type === "object") {
      emitNet("objectAdd", entity);
    } else if (entity.type === "marker") {
      emitNet("markerAdd", entity);
    } else if (entity.type === "label") {
      emitNet("textAdd", entity);
    }
  }

  remove(id: string): void {
    if (!this.cliententities.has(id)) {
      throw new Error(`Entity with id ${id} does not exist.`);
    }
    this.cliententities.delete(id);
  }
  update(entity: IEntity): void {
    if (!this.cliententities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} does not exist.`);
    }
    this.cliententities.set(entity.id, entity);
  }
  getEntity(id: string): IEntity | undefined {
    return this.cliententities.get(id);
  }

  getAllEntities(): Array<IEntity> {
    return Array.from(this.cliententities.values());
  }
  getEntitiesByType(type: string): Array<IEntity> {
    return Array.from(this.cliententities.values()).filter(
      (entity) => entity.type === type
    );
  }
}

onNet(
  EVENTS.Entity.Add,
  ClientEntityManager.prototype.add.bind(ClientEntityManager)
);
onNet(
  EVENTS.Entity.Remove,
  ClientEntityManager.prototype.remove.bind(ClientEntityManager)
);
onNet(
  EVENTS.Entity.Update,
  ClientEntityManager.prototype.update.bind(ClientEntityManager)
);
