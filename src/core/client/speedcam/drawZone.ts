import { CVector3 } from "@/core/shared/CVector3";
import { SpeedcamZoneConfig } from "./speedcam";
import { IEntity } from "@/core/shared/interfaces/IEntity";

export function drawSpeedcamZoneGrid(
  speedcamPos: CVector3,
  speedcamRotation: CVector3,
  config: SpeedcamZoneConfig = { leftAngleDegrees: 35, rightAngleDegrees: 35, maxDistance: 30 }
) {
  // Verwende die Offset-Position als Ausgangspunkt
  const offsetPos = getOffsetPosition(speedcamPos, speedcamRotation, config.positionOffset ?? 0, config.rotationOffset ?? 0);

  // Wende Rotations-Offset an
  const rotationOffset = (config.rotationOffset ?? 0) * Math.PI / 180;
  const speedcamHeading = (speedcamRotation.z * Math.PI) / 180 + rotationOffset;
  const leftAngle = speedcamHeading - (config.leftAngleDegrees * Math.PI) / 180;
  const rightAngle = speedcamHeading + (config.rightAngleDegrees * Math.PI) / 180;

  // Grid-Einstellungen
  const gridSteps = 5; // Anzahl der Gitterlinien
  const height = 3;
  const r = 0, g = 255, b = 255, a = 150; // Cyan

  // Zeichne radiale Linien (von Offset-Position nach außen)
  for (let i = 0; i <= gridSteps; i++) {
    const angle = leftAngle + (rightAngle - leftAngle) * (i / gridSteps);

    const endPoint = new CVector3(
      offsetPos.x + Math.cos(angle) * config.maxDistance,
      offsetPos.y + Math.sin(angle) * config.maxDistance,
      offsetPos.z
    );

    const endPointTop = new CVector3(endPoint.x, endPoint.y, offsetPos.z + height);
    const endPointBottom = new CVector3(endPoint.x, endPoint.y, offsetPos.z - height);
    const offsetTop = new CVector3(offsetPos.x, offsetPos.y, offsetPos.z + height);
    const offsetBottom = new CVector3(offsetPos.x, offsetPos.y, offsetPos.z - height);

    // Radiale Linien
    DrawLine(offsetPos.x, offsetPos.y, offsetPos.z, endPoint.x, endPoint.y, endPoint.z, r, g, b, a);
    DrawLine(offsetTop.x, offsetTop.y, offsetTop.z, endPointTop.x, endPointTop.y, endPointTop.z, r, g, b, a);
    DrawLine(offsetBottom.x, offsetBottom.y, offsetBottom.z, endPointBottom.x, endPointBottom.y, endPointBottom.z, r, g, b, a);
  }

  // Zeichne konzentrische Bögen
  const arcSteps = 4;
  for (let i = 1; i <= arcSteps; i++) {
    const distance = config.maxDistance * (i / arcSteps);
    const arcPoints = 10; // Punkte für den Bogen

    for (let j = 0; j < arcPoints; j++) {
      const angle1 = leftAngle + (rightAngle - leftAngle) * (j / arcPoints);
      const angle2 = leftAngle + (rightAngle - leftAngle) * ((j + 1) / arcPoints);

      const point1 = new CVector3(
        offsetPos.x + Math.cos(angle1) * distance,
        offsetPos.y + Math.sin(angle1) * distance,
        offsetPos.z
      );

      const point2 = new CVector3(
        offsetPos.x + Math.cos(angle2) * distance,
        offsetPos.y + Math.sin(angle2) * distance,
        offsetPos.z
      );

      // Bogen-Linien auf verschiedenen Höhen
      DrawLine(point1.x, point1.y, point1.z, point2.x, point2.y, point2.z, r, g, b, a);
      DrawLine(point1.x, point1.y, point1.z + height, point2.x, point2.y, point2.z + height, r, g, b, a);
      DrawLine(point1.x, point1.y, point1.z - height, point2.x, point2.y, point2.z - height, r, g, b, a);
    }
  }
}


export function getOffsetPosition(
  basePos: CVector3,
  rotation: CVector3,
  offset: number,
  rotationOffset: number = 0
): CVector3 {
  if (offset === 0) return basePos;

  // Wende den Rotations-Offset bereits hier an
  const correctedHeading = rotation.z + rotationOffset;
  const headingRad = (correctedHeading * Math.PI) / 180;
  const pitchRad = (rotation.x * Math.PI) / 180;

  const forwardX = Math.sin(headingRad);
  const forwardY = Math.cos(headingRad);
  
  const horizontalDistance = Math.cos(pitchRad) * offset;
  const verticalOffset = Math.sin(pitchRad) * offset;

  return new CVector3(
    basePos.x + forwardX * horizontalDistance,
    basePos.y + forwardY * horizontalDistance,
    basePos.z + verticalOffset
  );
}

export function checkPlayerInSpeedcamZone(entity : IEntity): boolean {
  if (!entity) return false;

  const playerPed = PlayerPedId();
  const playerPos = GetEntityCoords(playerPed, false);
  const speedcamPos = entity.pos.toArray();
  const speedcamRotation = entity.rot?.toArray() || [0, 0, 0];

      const position = new CVector3(playerPos[0], playerPos[1], playerPos[2]);
      const speedcamPosition = new CVector3(speedcamPos[0], speedcamPos[1], speedcamPos[2]);
      const rotation = new CVector3(speedcamRotation[0] ?? 0, speedcamRotation[1] ?? 0, speedcamRotation[2] ?? 0);
      const zoneConfig: SpeedcamZoneConfig = {
        leftAngleDegrees: 35,
        rightAngleDegrees: 35,
        maxDistance: 30
      };
      
      return isInSpeedcamZone(speedcamPosition, rotation, position, zoneConfig);
    }
  
    export function drawSpeedcamZone(
      speedcamPos: CVector3,
      speedcamRotation: CVector3,
      config: SpeedcamZoneConfig = { leftAngleDegrees: 35, rightAngleDegrees: 35, maxDistance: 30, positionOffset: 0 }
    ) {
      const [origin, left, right] = getSpeedcamZoneVertices(speedcamPos, speedcamRotation, config);
    
      // Linienfarbe (rot, grün, blau, alpha)
      const r = 255, g = 0, b = 0, a = 255;
    
      // Linie von Offset-Position zu linker Spitze
      DrawLine(origin.x, origin.y, origin.z, left.x, left.y, left.z, r, g, b, a);
      // Linie von Offset-Position zu rechter Spitze
      DrawLine(origin.x, origin.y, origin.z, right.x, right.y, right.z, r, g, b, a);
      // Linie zwischen linker und rechter Spitze (Kegelbasis)
      DrawLine(left.x, left.y, left.z, right.x, right.y, right.z, r, g, b, a);
    }
    
    
    
    export function isInSpeedcamZone(
      speedcamPos: CVector3,
      speedcamRotation: CVector3,
      targetPos: CVector3,
      config: SpeedcamZoneConfig = { leftAngleDegrees: 35, rightAngleDegrees: 35, maxDistance: 30, positionOffset: 0 }
    ): boolean {
      // Verwende die Offset-Position für die Berechnungen
      const offsetPos = getOffsetPosition(speedcamPos, speedcamRotation, config.positionOffset ?? 0);
      
      // Berechne die Entfernung zwischen Offset-Position und Ziel
      const distance = offsetPos.distanceTo(targetPos);
      
      // Prüfe ob das Ziel in der maximalen Reichweite ist
      if (distance > config.maxDistance) {
        return false;
      }
    
      // Berechne den Vektor von der Offset-Position zum Ziel
      const targetVector = {
        x: targetPos.x - offsetPos.x,
        y: targetPos.y - offsetPos.y
      };
    
      // Berechne den Winkel des Zielvektors (in Radians)
      const targetAngle = Math.atan2(targetVector.y, targetVector.x);
      
      // Konvertiere Speedcam Rotation zu Radians und wende Rotations-Offset an
      const rotationOffset = (config.rotationOffset ?? 0) * Math.PI / 180;
      const speedcamHeading = (speedcamRotation.z * Math.PI) / 180 + rotationOffset;
      
      // Berechne die Winkeldifferenz
      let angleDifference = targetAngle - speedcamHeading;
      
      // Normalisiere den Winkel auf -π bis π
      while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
      while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
      
      // Konvertiere zu Grad
      const angleDifferenceInDegrees = (angleDifference * 180) / Math.PI;
      
      // Prüfe ob das Ziel im Kegelbereich ist
      return angleDifferenceInDegrees >= -config.leftAngleDegrees && 
             angleDifferenceInDegrees <= config.rightAngleDegrees;
    }

    export function getSpeedcamZoneVertices(
      speedcamPos: CVector3,
      speedcamRotation: CVector3,
      config: SpeedcamZoneConfig = { leftAngleDegrees: 35, rightAngleDegrees: 35, maxDistance: 30, positionOffset: 0 }
    ): CVector3[] {
      // Verwende die Offset-Position als Ausgangspunkt
      const offsetPos = getOffsetPosition(speedcamPos, speedcamRotation, config.positionOffset ?? 0);
      
      // Wende Rotations-Offset an (falls vorhanden)
      const rotationOffset = (config.rotationOffset ?? 0) * Math.PI / 180;
      const speedcamHeading = (speedcamRotation.z * Math.PI) / 180 + rotationOffset;
      const leftAngle = speedcamHeading - (config.leftAngleDegrees * Math.PI) / 180;
      const rightAngle = speedcamHeading + (config.rightAngleDegrees * Math.PI) / 180;
      
      // Berechne die Eckpunkte des Kegels von der Offset-Position aus
      const leftPoint = new CVector3(
        offsetPos.x + Math.cos(leftAngle) * config.maxDistance,
        offsetPos.y + Math.sin(leftAngle) * config.maxDistance,
        offsetPos.z
      );
    
      const rightPoint = new CVector3(
        offsetPos.x + Math.cos(rightAngle) * config.maxDistance,
        offsetPos.y + Math.sin(rightAngle) * config.maxDistance,
        offsetPos.z
      );
      
      return [offsetPos, leftPoint, rightPoint];
    }

    export function drawSpeedcamZoneAdvanced(
      speedcamPos: CVector3,
      speedcamRotation: CVector3,
      config: SpeedcamZoneConfig = { leftAngleDegrees: 35, rightAngleDegrees: 35, maxDistance: 30, positionOffset: 0 }
    ) {
      // Verwende die Offset-Position als Ausgangspunkt
      // In drawSpeedcamZoneAdvanced und drawSpeedcamZoneGrid:
      const offsetPos = getOffsetPosition(speedcamPos, speedcamRotation, config.positionOffset ?? 0, config.rotationOffset ?? 0);

      // Wende Rotations-Offset an
      const rotationOffset = (config.rotationOffset ?? 0) * Math.PI / 180;
      const speedcamHeading = (speedcamRotation.z * Math.PI) / 180 + rotationOffset;
      const leftAngle = speedcamHeading - (config.leftAngleDegrees * Math.PI) / 180;
      const rightAngle = speedcamHeading + (config.rightAngleDegrees * Math.PI) / 180;
    
      // Grundfarben
      const height = 3;
      const r = 255, g = 0, b = 0, a = 150; // Rot
    
      // Zeichne die Kegelränder (links und rechts)
      const leftEndPoint = new CVector3(
        offsetPos.x + Math.cos(leftAngle) * config.maxDistance,
        offsetPos.y + Math.sin(leftAngle) * config.maxDistance,
        offsetPos.z
      );
    
      const rightEndPoint = new CVector3(
        offsetPos.x + Math.cos(rightAngle) * config.maxDistance,
        offsetPos.y + Math.sin(rightAngle) * config.maxDistance,
        offsetPos.z
      );
    
      // Zeichne die Hauptlinien des Kegels auf verschiedenen Höhen
      for (let h = -height; h <= height; h += height) {
        const offsetHeight = new CVector3(offsetPos.x, offsetPos.y, offsetPos.z + h);
        const leftHeight = new CVector3(leftEndPoint.x, leftEndPoint.y, leftEndPoint.z + h);
        const rightHeight = new CVector3(rightEndPoint.x, rightEndPoint.y, rightEndPoint.z + h);
    
        // Linke Kegellinie
        DrawLine(offsetHeight.x, offsetHeight.y, offsetHeight.z, leftHeight.x, leftHeight.y, leftHeight.z, r, g, b, a);
        // Rechte Kegellinie
        DrawLine(offsetHeight.x, offsetHeight.y, offsetHeight.z, rightHeight.x, rightHeight.y, rightHeight.z, r, g, b, a);
        // Kegelbasis
        DrawLine(leftHeight.x, leftHeight.y, leftHeight.z, rightHeight.x, rightHeight.y, rightHeight.z, r, g, b, a);
      }
    
      // Zeichne vertikale Verbindungslinien
      DrawLine(offsetPos.x, offsetPos.y, offsetPos.z - height, offsetPos.x, offsetPos.y, offsetPos.z + height, r, g, b, a);
      DrawLine(leftEndPoint.x, leftEndPoint.y, leftEndPoint.z - height, leftEndPoint.x, leftEndPoint.y, leftEndPoint.z + height, r, g, b, a);
      DrawLine(rightEndPoint.x, rightEndPoint.y, rightEndPoint.z - height, rightEndPoint.x, rightEndPoint.y, rightEndPoint.z + height, r, g, b, a);
    
      // Zeichne zusätzliche Entfernungsmarkierungen
      const distanceSteps = 4;
      for (let i = 1; i <= distanceSteps; i++) {
        const distance = config.maxDistance * (i / distanceSteps);
        
        const leftPoint = new CVector3(
          offsetPos.x + Math.cos(leftAngle) * distance,
          offsetPos.y + Math.sin(leftAngle) * distance,
          offsetPos.z
        );
    
        const rightPoint = new CVector3(
          offsetPos.x + Math.cos(rightAngle) * distance,
          offsetPos.y + Math.sin(rightAngle) * distance,
          offsetPos.z
        );
    
        // Zeichne Querlinien für Entfernungsmarkierungen
        DrawLine(leftPoint.x, leftPoint.y, leftPoint.z, rightPoint.x, rightPoint.y, rightPoint.z, r, g, b, a);
        DrawLine(leftPoint.x, leftPoint.y, leftPoint.z + height, rightPoint.x, rightPoint.y, rightPoint.z + height, r, g, b, a);
        DrawLine(leftPoint.x, leftPoint.y, leftPoint.z - height, rightPoint.x, rightPoint.y, rightPoint.z - height, r, g, b, a);
      }
    }