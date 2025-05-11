import { IBaseModel } from "./IBaseModel";

export interface IRepository<T extends IBaseModel> {
  /**
   * Find a document by ID
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Find documents matching a filter
   */
  find(filter: Partial<T>): Promise<T[]>;
  
  /**
   * Find a single document matching a filter
   */
  findOne(filter: Partial<T>): Promise<T | null>;
  
  /**
   * Create a new document
   */
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  
  /**
   * Update a document by ID
   */
  update(id: string, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete a document by ID
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Count documents matching a filter
   */
  count(filter?: Partial<T>): Promise<number>;

  exists(id: string): Promise<boolean>;
  
}