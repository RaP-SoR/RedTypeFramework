import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityColShapeData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";
import { EntityMarker } from "./marker";
import { EntityTextLabel } from "./textlabel";

let activeColShapes: Map<string, IEntity> = new Map();
let playerInColShapes: Set<string> = new Set();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityColShape {
  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreateColShape(entityWithPos);
  }

  static delete(id: string) {
    console.log(`Streaming OUT: Removing colshape for entity ${id}`);

    const colshape = activeColShapes.get(id);
    if (colshape) {
      const data = colshape.data as IEntityColShapeData;

      if (data.showMarker) {
        EntityMarker.remove(`${id}_marker`);
      }

      if (data.showTextLabel) {
        EntityTextLabel.remove(`${id}_textlabel`);
      }
    }

    activeColShapes.delete(id);

    if (playerInColShapes.has(id)) {
      this.triggerExitEvent(id);
      playerInColShapes.delete(id);
    }
  }

  static remove(id: string) {
    console.log(`PERMANENT: Removing colshape for entity ${id}`);
    this.delete(id);
  }

  static update(id: string) {
    const colshape = activeColShapes.get(id);
    if (!colshape) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "colshape") return;

      this.remove(id);
      this.add(entity);
    }
  }

  private static checkAndCreateColShape(colshape: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = colshape.pos.distanceTo(lastPlayerPos);
    if (
      !activeColShapes.has(colshape.id) &&
      distance <= colshape.streamDistance
    ) {
      activeColShapes.set(colshape.id, colshape);

      const data = colshape.data as IEntityColShapeData;

      if (data.showMarker && data.markerData) {
        const markerEntity: IEntity = {
          id: `${colshape.id}_marker`,
          type: "marker",
          pos: colshape.pos,
          streamDistance: colshape.streamDistance,
          data: data.markerData,
        };
        EntityMarker.add(markerEntity);
      }

      if (data.showTextLabel && data.textLabelData) {
        const textLabelEntity: IEntity = {
          id: `${colshape.id}_textlabel`,
          type: "textlabel",
          pos: colshape.pos,
          streamDistance: colshape.streamDistance,
          scale: colshape.scale,
          data: data.textLabelData,
        };
        EntityTextLabel.add(textLabelEntity);
      }

      console.log(`Created colshape ${colshape.id} at distance ${distance}`);
    }
  }

  public static streamColShapes() {
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

      const colshapesToRemove: string[] = [];
      const colshapesToCreate: IEntity[] = [];

      activeColShapes.forEach((colshape, id) => {
        const distance = colshape.pos.distanceTo(playerPos);
        if (distance > colshape.streamDistance) {
          colshapesToRemove.push(id);
        }
      });

      const allColShapes = ClientEntityManager.getEntitiesByType("colshape");
      allColShapes.forEach((colshape) => {
        if (!activeColShapes.has(colshape.id)) {
          const colshapePos = new CVector3(
            colshape.pos.x,
            colshape.pos.y,
            colshape.pos.z
          );
          const distance = colshapePos.distanceTo(playerPos);
          if (distance <= colshape.streamDistance) {
            const entityWithPos = { ...colshape, pos: colshapePos };
            colshapesToCreate.push(entityWithPos);
          }
        }
      });

      colshapesToRemove.forEach((id) => this.delete(id));
      colshapesToCreate.forEach((colshape) =>
        this.checkAndCreateColShape(colshape)
      );

      console.log(
        `ColShapes Streamed: Removed ${colshapesToRemove.length}, Created ${colshapesToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamColShapes();
  }

  private static isPlayerInColShape(
    colshape: IEntity,
    playerPos: CVector3
  ): boolean {
    const data = colshape.data as IEntityColShapeData;

    switch (data.shape) {
      case "sphere":
        return this.isPlayerInSphere(
          colshape.pos,
          data.radius || 5.0,
          playerPos
        );

      case "cylinder":
        return this.isPlayerInCylinder(
          colshape.pos,
          data.radius || 5.0,
          data.height || 5.0,
          playerPos
        );

      case "box":
        return this.isPlayerInBox(
          colshape.pos,
          data.width || 5.0,
          data.depth || 5.0,
          data.height || 5.0,
          playerPos
        );

      case "polygon":
        return data.points
          ? this.isPlayerInPolygon(data.points, playerPos)
          : false;

      default:
        return false;
    }
  }

  private static isPlayerInSphere(
    center: CVector3,
    radius: number,
    playerPos: CVector3
  ): boolean {
    return center.distanceTo(playerPos) <= radius;
  }

  private static isPlayerInCylinder(
    center: CVector3,
    radius: number,
    height: number,
    playerPos: CVector3
  ): boolean {
    const distance2D = Math.sqrt(
      Math.pow(playerPos.x - center.x, 2) + Math.pow(playerPos.y - center.y, 2)
    );
    const heightDiff = Math.abs(playerPos.z - center.z);

    return distance2D <= radius && heightDiff <= height / 2;
  }

  private static isPlayerInBox(
    center: CVector3,
    width: number,
    depth: number,
    height: number,
    playerPos: CVector3
  ): boolean {
    const dx = Math.abs(playerPos.x - center.x);
    const dy = Math.abs(playerPos.y - center.y);
    const dz = Math.abs(playerPos.z - center.z);

    return dx <= width / 2 && dy <= depth / 2 && dz <= height / 2;
  }

  private static isPlayerInPolygon(
    points: CVector3[],
    playerPos: CVector3
  ): boolean {
    let inside = false;
    const x = playerPos.x;
    const y = playerPos.y;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x;
      const yi = points[i].y;
      const xj = points[j].x;
      const yj = points[j].y;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  public static checkColShapeCollisions() {
    const playerPed = PlayerPedId();
    const [x, y, z] = GetEntityCoords(playerPed, false);
    const playerPos = new CVector3(x, y, z);

    activeColShapes.forEach((colshape, id) => {
      const isInside = this.isPlayerInColShape(colshape, playerPos);
      const wasInside = playerInColShapes.has(id);

      if (isInside && !wasInside) {
        playerInColShapes.add(id);
        this.triggerEnterEvent(id);
      } else if (!isInside && wasInside) {
        playerInColShapes.delete(id);
        this.triggerExitEvent(id);
      }
    });
  }

  private static triggerEnterEvent(colshapeId: string) {
    const colshape = activeColShapes.get(colshapeId);
    if (colshape) {
      const data = colshape.data as IEntityColShapeData;
      if (data.onEnter) {
        console.log(`Player entered colshape: ${colshapeId}`);
        emit(data.onEnter, colshapeId, colshape);
      }
    }
  }

  private static triggerExitEvent(colshapeId: string) {
    const colshape = activeColShapes.get(colshapeId);
    if (colshape) {
      const data = colshape.data as IEntityColShapeData;
      if (data.onExit) {
        console.log(`Player left colshape: ${colshapeId}`);
        emit(data.onExit, colshapeId, colshape);
      }
    }
  }

  static getActiveColShapes(): Map<string, IEntity> {
    return new Map(activeColShapes);
  }

  static isPlayerInAnyColShape(): boolean {
    return playerInColShapes.size > 0;
  }

  static getPlayerColShapes(): string[] {
    return Array.from(playerInColShapes);
  }
}

setInterval(() => {
  EntityColShape.streamColShapes();
}, STREAM_INTERVAL);

setInterval(() => {
  EntityColShape.checkColShapeCollisions();
}, 100);

onNet("baseevents:enteredVehicle", () => {
  EntityColShape.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityColShape.forceStream();
});
