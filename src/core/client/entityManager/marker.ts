import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityMarkerData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdMarkers: Map<string, IEntity> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityMarker {
  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreateMarker(entityWithPos);
  }

  static delete(id: string) {
    console.log(`Streaming OUT: Removing marker for entity ${id}`);
    createdMarkers.delete(id);
  }

  static remove(id: string) {
    console.log(`PERMANENT: Removing marker for entity ${id}`);
    createdMarkers.delete(id);
  }

  static update(id: string) {
    const marker = createdMarkers.get(id);
    if (!marker) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "marker") return;
      createdMarkers.set(id, entity);
    }
  }

  private static checkAndCreateMarker(marker: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = marker.pos.distanceTo(lastPlayerPos);
    if (!createdMarkers.has(marker.id) && distance <= marker.streamDistance) {
      createdMarkers.set(marker.id, marker);
      console.log(`Created marker ${marker.id} at distance ${distance}`);
    }
  }

  public static streamMarkers() {
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

      const markersToRemove: string[] = [];
      const markersToCreate: IEntity[] = [];

      createdMarkers.forEach((marker, id) => {
        const distance = marker.pos.distanceTo(playerPos);
        if (distance > marker.streamDistance) {
          markersToRemove.push(id);
        }
      });

      const allMarkers = ClientEntityManager.getEntitiesByType("marker");
      allMarkers.forEach((marker) => {
        if (!createdMarkers.has(marker.id)) {
          const markerPos = new CVector3(
            marker.pos.x,
            marker.pos.y,
            marker.pos.z
          );
          const distance = markerPos.distanceTo(playerPos);
          if (distance <= marker.streamDistance) {
            const entityWithPos = { ...marker, pos: markerPos };
            markersToCreate.push(entityWithPos);
          }
        }
      });

      markersToRemove.forEach((id) => this.delete(id));
      markersToCreate.forEach((marker) => {
        createdMarkers.set(marker.id, marker);
      });

      console.log(
        `Markers Streamed: Removed ${markersToRemove.length}, Created ${markersToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamMarkers();
  }

  public static renderMarkers() {
    const playerPed = PlayerPedId();
    const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, false);
    const playerPos = new CVector3(playerX, playerY, playerZ);

    createdMarkers.forEach((marker) => {
      const distance = marker.pos.distanceTo(playerPos);
      const data = marker.data as IEntityMarkerData;

      if (distance <= marker.streamDistance) {
        this.drawMarker(marker.pos.x, marker.pos.y, marker.pos.z, data);
      }
    });
  }

  private static drawMarker(
    x: number,
    y: number,
    z: number,
    data: IEntityMarkerData
  ) {
    DrawMarker(
      data.type || 1, // Marker Type
      x,
      y,
      z, // Position
      data.dirX || 0.0, // Direction X
      data.dirY || 0.0, // Direction Y
      data.dirZ || 0.0, // Direction Z
      data.rotX || 0.0, // Rotation X
      data.rotY || 0.0, // Rotation Y
      data.rotZ || 0.0, // Rotation Z
      data.scaleX || 1.0, // Scale X
      data.scaleY || 1.0, // Scale Y
      data.scaleZ || 1.0, // Scale Z
      data.red || 255, // Red
      data.green || 255, // Green
      data.blue || 255, // Blue
      data.alpha || 100, // Alpha
      data.bobUpAndDown || false, // Bob up and down
      data.faceCamera || true, // Face camera
      2, // p19 (unknown)
      data.rotate || false, // Rotate
      data.textureDict || "", // Texture dictionary
      data.textureName || "", // Texture name
      data.drawOnEnts || false // Draw on entities
    );
  }
}

setInterval(() => {
  EntityMarker.streamMarkers();
}, STREAM_INTERVAL);

setTick(() => {
  EntityMarker.renderMarkers();
});

onNet("baseevents:enteredVehicle", () => {
  EntityMarker.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityMarker.forceStream();
});
