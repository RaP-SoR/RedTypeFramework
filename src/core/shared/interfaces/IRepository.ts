import { IBaseModel } from "./IBaseModel";

export interface IRepository<T extends IBaseModel> {
  /**
   * Find a document by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all documents matching a filter
   */
  findAll(filter: Partial<T>): Promise<T[]>;

  /**
   * Find a single document matching a filter
   */
  findOne(filter: Partial<T>): Promise<T | null>;

  /**
   * Insert a new document
   */
  insert(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;

  /**
   * Update a document by ID
   */
  update(id: string, data: Partial<T>): Promise<T | boolean | null>;

  /**
   * Delete a document by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count documents matching a filter
   */
  count(filter?: Partial<T>): Promise<number>;
}
