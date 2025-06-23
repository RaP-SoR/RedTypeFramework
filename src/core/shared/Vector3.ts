export interface IVector3 {
  x: number;
  y: number;
  z: number;
}

export class Vector3 implements IVector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Factory-Methoden
  static fromArray(arr: Array<number>): Vector3 {
    if (arr.length < 3) {
      throw new Error("Array muss mindestens 3 Elemente enthalten");
    }
    return new Vector3(arr[0], arr[1], arr[2]);
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  static up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  static forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  static back(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  static right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  toArray(): Array<number> {
    return [this.x, this.y, this.z];
  }

  toObject(): IVector3 {
    return { x: this.x, y: this.y, z: this.z };
  }

  add(other: Vector3 | IVector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  addSelf(other: Vector3 | IVector3): this {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  subtract(other: Vector3 | IVector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  subtractSelf(other: Vector3 | IVector3): this {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  multiply(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  multiplySelf(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  multiplyVec(other: Vector3 | IVector3): Vector3 {
    return new Vector3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  divide(scalar: number): Vector3 {
    if (scalar === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  divideSelf(scalar: number): this {
    if (scalar === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;
    return this;
  }

  dot(other: Vector3 | IVector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vector3 | IVector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  // Vergleichsmethoden
  equals(other: Vector3 | IVector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * Vergleicht mit Toleranz für Floating-Point-Ungenauigkeiten
   */
  equalsWithEpsilon(
    other: Vector3 | IVector3,
    epsilon: number = 0.0001
  ): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  toString(): string {
    return `${this.x}, ${this.y}, ${this.z}`;
  }

  // Distanz- und Längenberechnungen
  distanceTo(other: Vector3 | IVector3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  distanceToSquared(other: Vector3 | IVector3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  normalize(): Vector3 {
    const length = this.length();
    if (length === 0) {
      return new Vector3(0, 0, 0);
    }
    return this.divide(length);
  }

  normalizeSelf(): this {
    const length = this.length();
    if (length === 0) {
      return this;
    }
    return this.divideSelf(length);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  // Rotations- und Transformationsmethoden
  rotateX(angle: number): Vector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const y = this.y * cos - this.z * sin;
    const z = this.y * sin + this.z * cos;
    return new Vector3(this.x, y, z);
  }

  rotateY(angle: number): Vector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = this.z * sin + this.x * cos;
    const z = this.z * cos - this.x * sin;
    return new Vector3(x, this.y, z);
  }

  rotateZ(angle: number): Vector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    return new Vector3(x, y, this.z);
  }

  // Interpolation
  static lerp(
    a: Vector3 | IVector3,
    b: Vector3 | IVector3,
    t: number
  ): Vector3 {
    t = Math.max(0, Math.min(1, t)); // Auf [0,1] begrenzen
    return new Vector3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  // Clone
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  // Set
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setFromVector(other: Vector3 | IVector3): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  // Min/Max
  min(other: Vector3 | IVector3): Vector3 {
    return new Vector3(
      Math.min(this.x, other.x),
      Math.min(this.y, other.y),
      Math.min(this.z, other.z)
    );
  }

  max(other: Vector3 | IVector3): Vector3 {
    return new Vector3(
      Math.max(this.x, other.x),
      Math.max(this.y, other.y),
      Math.max(this.z, other.z)
    );
  }
}
