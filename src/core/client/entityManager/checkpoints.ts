import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityCheckpointData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdCheckpoints: Map<string, IEntity> = new Map();
let checkpointIds: Map<string, number> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityCheckpoint {
  static create(entity: IEntity): number {
    entity.pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const data = entity.data as IEntityCheckpointData;

    const checkpointHandle = CreateCheckpoint(
      data.type || 47, // Checkpoint Type
      entity.pos.x, // Position X
      entity.pos.y, // Position Y
      entity.pos.z, // Position Z
      data.nextX || entity.pos.x, // Next Position X
      data.nextY || entity.pos.y, // Next Position Y
      data.nextZ || entity.pos.z, // Next Position Z
      data.radius || 2.0, // Radius
      data.red || 255, // Red
      data.green || 255, // Green
      data.blue || 255, // Blue
      data.alpha || 100, // Alpha
      data.reserved || 0 // Reserved
    );

    checkpointIds.set(entity.id, checkpointHandle);
    createdCheckpoints.set(entity.id, entity);

    console.log(
      `Created checkpoint ${checkpointHandle} for entity ${entity.id}`
    );
    return checkpointHandle;
  }

  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreateCheckpoint(entityWithPos);
  }

  static delete(id: string) {
    const checkpointHandle = checkpointIds.get(id);
    if (checkpointHandle) {
      console.log(
        `Streaming OUT: Removing checkpoint ${checkpointHandle} for entity ${id}`
      );
      DeleteCheckpoint(checkpointHandle);
      checkpointIds.delete(id);
    }
    createdCheckpoints.delete(id);
  }

  static remove(id: string) {
    const checkpointHandle = checkpointIds.get(id);
    if (checkpointHandle) {
      console.log(
        `PERMANENT: Removing checkpoint ${checkpointHandle} for entity ${id}`
      );
      DeleteCheckpoint(checkpointHandle);
      checkpointIds.delete(id);
    }
    createdCheckpoints.delete(id);
  }

  static update(id: string) {
    const checkpoint = createdCheckpoints.get(id);
    if (!checkpoint) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "checkpoint") return;

      this.remove(id);
      this.create(entity);
    }
  }

  private static checkAndCreateCheckpoint(checkpoint: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = checkpoint.pos.distanceTo(lastPlayerPos);
    if (
      !createdCheckpoints.has(checkpoint.id) &&
      distance <= checkpoint.streamDistance
    ) {
      this.create(checkpoint);
    }
  }

  public static streamCheckpoints() {
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

      const checkpointsToRemove: string[] = [];
      const checkpointsToCreate: IEntity[] = [];

      createdCheckpoints.forEach((checkpoint, id) => {
        const distance = checkpoint.pos.distanceTo(playerPos);
        if (distance > checkpoint.streamDistance) {
          checkpointsToRemove.push(id);
        }
      });

      const allCheckpoints =
        ClientEntityManager.getEntitiesByType("checkpoint");
      allCheckpoints.forEach((checkpoint) => {
        if (!createdCheckpoints.has(checkpoint.id)) {
          const checkpointPos = new CVector3(
            checkpoint.pos.x,
            checkpoint.pos.y,
            checkpoint.pos.z
          );
          const distance = checkpointPos.distanceTo(playerPos);
          if (distance <= checkpoint.streamDistance) {
            const entityWithPos = { ...checkpoint, pos: checkpointPos };
            checkpointsToCreate.push(entityWithPos);
          }
        }
      });

      checkpointsToRemove.forEach((id) => this.delete(id));
      checkpointsToCreate.forEach((checkpoint) => this.create(checkpoint));

      console.log(
        `Checkpoints Streamed: Removed ${checkpointsToRemove.length}, Created ${checkpointsToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamCheckpoints();
  }

  static isPlayerInCheckpoint(checkpointId: string): boolean {
    const checkpointHandle = checkpointIds.get(checkpointId);
    if (!checkpointHandle) return false;

    const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
    const checkpoint = createdCheckpoints.get(checkpointId);
    if (!checkpoint) return false;

    const data = checkpoint.data as IEntityCheckpointData;
    const distance = new CVector3(x, y, z).distanceTo(checkpoint.pos);

    return distance <= (data.radius || 2.0);
  }

  static getActiveCheckpoints(): Map<string, IEntity> {
    return new Map(createdCheckpoints);
  }
}

setInterval(() => {
  EntityCheckpoint.streamCheckpoints();
}, STREAM_INTERVAL);

onNet("baseevents:enteredVehicle", () => {
  EntityCheckpoint.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityCheckpoint.forceStream();
});

setTick(() => {
  const playerPed = PlayerPedId();
  const [x, y, z] = GetEntityCoords(playerPed, false);
  const playerPos = new CVector3(x, y, z);

  createdCheckpoints.forEach((checkpoint, id) => {
    const data = checkpoint.data as IEntityCheckpointData;
    const distance = playerPos.distanceTo(checkpoint.pos);
    const isInside = distance <= (data.radius || 2.0);

    if (isInside && data.onEnter) {
      emitNet(`checkpoint:entered:${id}`, checkpoint);
    } else if (!isInside && data.onExit) {
      emitNet(`checkpoint:left:${id}`, checkpoint);
    }
  });
});
