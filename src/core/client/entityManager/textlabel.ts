import { CVector3 } from "@shared/CVector3";
import { IEntity, IEntityLabelData } from "@shared/interfaces/IEntity";
import { ClientEntityManager } from "./entityManager";

let createdTextLabels: Map<string, IEntity> = new Map();
let lastPlayerPos: CVector3 | null = null;
let isStreaming = false;
const STREAM_DISTANCE_THRESHOLD = 5.0;
const STREAM_INTERVAL = 2000;

export class EntityTextLabel {
  static add(entity: IEntity) {
    const pos = new CVector3(entity.pos.x, entity.pos.y, entity.pos.z);
    const entityWithPos = { ...entity, pos };
    this.checkAndCreateTextLabel(entityWithPos);
  }

  static delete(id: string) {
    console.log(`Streaming OUT: Removing text label for entity ${id}`);
    createdTextLabels.delete(id);
  }

  static remove(id: string) {
    console.log(`PERMANENT: Removing text label for entity ${id}`);
    createdTextLabels.delete(id);
  }

  static update(id: string) {
    const textLabel = createdTextLabels.get(id);
    if (!textLabel) {
      const entity = ClientEntityManager.getEntity(id);
      if (!entity || entity.type !== "textlabel") return;
      createdTextLabels.set(id, entity);
    }
  }

  private static checkAndCreateTextLabel(textLabel: IEntity) {
    if (!lastPlayerPos) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
      lastPlayerPos = new CVector3(x, y, z);
    }

    const distance = textLabel.pos.distanceTo(lastPlayerPos);
    if (
      !createdTextLabels.has(textLabel.id) &&
      distance <= textLabel.streamDistance
    ) {
      createdTextLabels.set(textLabel.id, textLabel);
      console.log(`Created text label ${textLabel.id} at distance ${distance}`);
    }
  }

  public static streamTextLabels() {
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

      const labelsToRemove: string[] = [];
      const labelsToCreate: IEntity[] = [];

      createdTextLabels.forEach((label, id) => {
        const distance = label.pos.distanceTo(playerPos);
        if (distance > label.streamDistance) {
          labelsToRemove.push(id);
        }
      });

      const allTextLabels = ClientEntityManager.getEntitiesByType("textlabel");
      allTextLabels.forEach((label) => {
        if (!createdTextLabels.has(label.id)) {
          const labelPos = new CVector3(label.pos.x, label.pos.y, label.pos.z);
          const distance = labelPos.distanceTo(playerPos);
          if (distance <= label.streamDistance) {
            const entityWithPos = { ...label, pos: labelPos };
            labelsToCreate.push(entityWithPos);
          }
        }
      });

      labelsToRemove.forEach((id) => this.delete(id));
      labelsToCreate.forEach((label) => {
        createdTextLabels.set(label.id, label);
      });

      console.log(
        `Text Labels Streamed: Removed ${labelsToRemove.length}, Created ${labelsToCreate.length}`
      );
    } finally {
      isStreaming = false;
    }
  }

  static forceStream() {
    this.streamTextLabels();
  }

  public static renderTextLabels() {
    const playerPed = PlayerPedId();
    const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, false);
    const playerPos = new CVector3(playerX, playerY, playerZ);

    createdTextLabels.forEach((label) => {
      const distance = label.pos.distanceTo(playerPos);
      const data = label.data as IEntityLabelData;

      if (distance <= (label.streamDistance || 50.0)) {
        const scale = Math.max(
          0.2,
          (label.scale || 0.5) * (10 / Math.max(distance, 1))
        );

        this.draw3DText(
          label.pos.x,
          label.pos.y,
          label.pos.z,
          data.text,
          scale,
          data.font || 4,
          data.color || [255, 255, 255, 255],
          data.backgroundColor,
          data.drawBackground || false
        );
      }
    });
  }

  private static draw3DText(
    x: number,
    y: number,
    z: number,
    text: string,
    scale: number,
    font: number,
    color: [number, number, number, number],
    backgroundColor?: [number, number, number, number],
    drawBackground: boolean = false
  ) {
    const [onScreen, screenX, screenY] = GetScreenCoordFromWorldCoord(x, y, z);

    if (onScreen) {
      SetTextScale(scale, scale);
      SetTextFont(font);
      SetTextProportional(true);
      SetTextColour(color[0], color[1], color[2], color[3]);
      SetTextDropshadow(0, 0, 0, 0, 255);
      SetTextEdge(2, 0, 0, 0, 150);
      SetTextDropShadow();
      SetTextOutline();
      SetTextEntry("STRING");
      SetTextCentre(true);

      if (drawBackground && backgroundColor) {
        const approximateWidth = text.length * scale * 0.012;
        const textHeight = scale * 0.08;

        DrawRect(
          screenX,
          screenY,
          approximateWidth + 0.02,
          textHeight + 0.01,
          backgroundColor[0],
          backgroundColor[1],
          backgroundColor[2],
          backgroundColor[3]
        );
      }

      AddTextComponentString(text);
      DrawText(screenX, screenY);
    }
  }
}

setInterval(() => {
  EntityTextLabel.streamTextLabels();
}, STREAM_INTERVAL);

setTick(() => {
  EntityTextLabel.renderTextLabels();
});

onNet("baseevents:enteredVehicle", () => {
  EntityTextLabel.forceStream();
});

onNet("baseevents:leftVehicle", () => {
  EntityTextLabel.forceStream();
});
