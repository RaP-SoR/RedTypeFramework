export interface ICVector3 {
  x: number;
  y: number;
  z: number;
}

export class CVector3 implements ICVector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Factory-Methoden
  static fromArray(arr: Array<number>): CVector3 {
    if (arr.length < 3) {
      throw new Error("Array muss mindestens 3 Elemente enthalten");
    }
    return new CVector3(arr[0], arr[1], arr[2]);
  }

  static zero(): CVector3 {
    return new CVector3(0, 0, 0);
  }

  static one(): CVector3 {
    return new CVector3(1, 1, 1);
  }

  static up(): CVector3 {
    return new CVector3(0, 1, 0);
  }

  static down(): CVector3 {
    return new CVector3(0, -1, 0);
  }

  static forward(): CVector3 {
    return new CVector3(0, 0, 1);
  }

  static back(): CVector3 {
    return new CVector3(0, 0, -1);
  }

  static right(): CVector3 {
    return new CVector3(1, 0, 0);
  }

  static left(): CVector3 {
    return new CVector3(-1, 0, 0);
  }

  toArray(): Array<number> {
    return [this.x, this.y, this.z];
  }

  toObject(): ICVector3 {
    return { x: this.x, y: this.y, z: this.z };
  }

  add(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  addSelf(other: CVector3 | ICVector3): this {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  subtract(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  subtractSelf(other: CVector3 | ICVector3): this {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  multiply(scalar: number): CVector3 {
    return new CVector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  multiplySelf(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  multiplyVec(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  divide(scalar: number): CVector3 {
    if (scalar === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    return new CVector3(this.x / scalar, this.y / scalar, this.z / scalar);
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

  dot(other: CVector3 | ICVector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  // Vergleichsmethoden
  equals(other: CVector3 | ICVector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * Vergleicht mit Toleranz für Floating-Point-Ungenauigkeiten
   */
  equalsWithEpsilon(
    other: CVector3 | ICVector3,
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
  distanceTo(other: CVector3 | ICVector3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  distanceToSquared(other: CVector3 | ICVector3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  normalize(): CVector3 {
    const length = this.length();
    if (length === 0) {
      return new CVector3(0, 0, 0);
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
  rotateX(angle: number): CVector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const y = this.y * cos - this.z * sin;
    const z = this.y * sin + this.z * cos;
    return new CVector3(this.x, y, z);
  }

  rotateY(angle: number): CVector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = this.z * sin + this.x * cos;
    const z = this.z * cos - this.x * sin;
    return new CVector3(x, this.y, z);
  }

  rotateZ(angle: number): CVector3 {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    return new CVector3(x, y, this.z);
  }

  // Interpolation
  static lerp(
    a: CVector3 | ICVector3,
    b: CVector3 | ICVector3,
    t: number
  ): CVector3 {
    t = Math.max(0, Math.min(1, t)); // Auf [0,1] begrenzen
    return new CVector3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  // Clone
  clone(): CVector3 {
    return new CVector3(this.x, this.y, this.z);
  }

  // Set
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setFromVector(other: CVector3 | ICVector3): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  // Min/Max
  min(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(
      Math.min(this.x, other.x),
      Math.min(this.y, other.y),
      Math.min(this.z, other.z)
    );
  }

  max(other: CVector3 | ICVector3): CVector3 {
    return new CVector3(
      Math.max(this.x, other.x),
      Math.max(this.y, other.y),
      Math.max(this.z, other.z)
    );
  }
}
