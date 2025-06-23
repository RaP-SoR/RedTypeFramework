import { EVENTS } from "@shared/events/server";
import { IEntity } from "@shared/interfaces/IEntity";

export class EntityManager {
  private static entities: Map<string, IEntity> = new Map();

  static add(entity: IEntity): void {
    if (this.entities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} already exists.`);
    }
    this.entities.set(entity.id, entity);
    emitNet(EVENTS.Entity.Add, entity);
  }

  static remove(id: string): void {
    if (!this.entities.has(id)) {
      throw new Error(`Entity with id ${id} does not exist.`);
    }
    this.entities.delete(id);
    emitNet(EVENTS.Entity.Remove, id);
  }
  static update(entity: IEntity): void {
    if (!this.entities.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} does not exist.`);
    }
    this.entities.set(entity.id, entity);
    emitNet(EVENTS.Entity.Update, entity);
  }
  static getEntity(id: string): IEntity | undefined {
    return this.entities.get(id);
  }

  static getAllEntities(): Array<IEntity> {
    return Array.from(this.entities.values());
  }

  static getEntitiesByType(type: string): Array<IEntity> {
    return Array.from(this.entities.values()).filter(
      (entity) => entity.type === type
    );
  }
}
