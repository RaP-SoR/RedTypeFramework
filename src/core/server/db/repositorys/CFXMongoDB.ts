import { IBaseModel } from "@rtf/shared/interfaces/IBaseModel";
import { IRepository } from "@rtf/shared/interfaces/IRepository";

/**
 * MongoDB implementation for FiveM resource exports
 */
export class CFXMongoDB<T extends IBaseModel> implements IRepository<T> {
  private collectionName: string;
  private connection: any;
  private resourceName: string = "cfx-mongodb";
  constructor(collectionName: string, resourceName: string = "cfx-mongodb") {
    this.collectionName = collectionName;
    this.resourceName = resourceName;
  }

  /**
   * Find a document by ID
   */
  public async findById(id: string): Promise<T | null> {
    try {
      const result = await exports[this.resourceName].findById(
        this.collectionName,
        id
      );

      if (!result) {
        return null;
      }

      return this.mapDocumentToModel(result);
    } catch (error) {
      console.error(
        `[MongoDB-Repository] Error finding document by ID ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find documents matching a filter
   */
  public async find(filter: Partial<T>): Promise<T[]> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      const results = await exports[this.resourceName].find(
        this.collectionName,
        mongoFilter
      );

      return Array.isArray(results)
        ? results.map((doc) => this.mapDocumentToModel(doc))
        : [];
    } catch (error) {
      console.error("[MongoDB-Repository] Error finding documents:", error);
      throw error;
    }
  }
  /**
   * Find documents all Documents
   */
  public async getCollection(): Promise<T[]> {
    try {
      const results = await exports[this.resourceName].find(
        this.collectionName,
        {}
      );

      return Array.isArray(results)
        ? results.map((doc) => this.mapDocumentToModel(doc))
        : [];
    } catch (error) {
      console.error("[MongoDB-Repository] Error finding documents:", error);
      throw error;
    }
  }

  /**
   * Find a single document matching a filter
   */
  public async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      const result = await exports[this.resourceName].findOne(
        this.collectionName,
        mongoFilter
      );

      if (!result) {
        return null;
      }

      return this.mapDocumentToModel(result);
    } catch (error) {
      console.error("[MongoDB-Repository] Error finding document:", error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  public async create(
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    try {
      const now = new Date();
      const doc = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = await exports[this.resourceName].insertOne(
        this.collectionName,
        doc
      );

      return this.mapDocumentToModel({
        _id: result.insertedId,
        ...doc,
      });
    } catch (error) {
      console.error("[MongoDB-Repository] Error creating document:", error);
      throw error;
    }
  }

  /**
   * Update a document by ID
   */
  public async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      // Ensure we don't override id, createdAt
      const { id: _, createdAt: __, ...updateData } = data as any;

      const updateDoc = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      const result = await exports[this.resourceName].updateOne(
        this.collectionName,
        { _id: id },
        updateDoc,
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      return this.mapDocumentToModel(result);
    } catch (error) {
      console.error(
        `[MongoDB-Repository] Error updating document ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const result = await exports[this.resourceName].deleteOne(
        this.collectionName,
        { _id: id }
      );

      return result.deletedCount === 1;
    } catch (error) {
      console.error(
        `[MongoDB-Repository] Error deleting document ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Count documents matching a filter
   */
  public async count(filter: Partial<T> = {}): Promise<number> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      return await exports[this.resourceName].countDocuments(
        this.collectionName,
        mongoFilter
      );
    } catch (error) {
      console.error("[MongoDB-Repository] Error counting documents:", error);
      throw error;
    }
  }
  public async exists(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  /**
   * Prepare filter for MongoDB query
   */
  private prepareFilter(filter: Partial<T>): Record<string, any> {
    const mongoFilter: Record<string, any> = {};

    // Handle ID field conversion for consistency
    if ((filter as any).id) {
      mongoFilter._id = (filter as any).id;
      delete (filter as any).id;
    }

    // Copy remaining filter properties
    return { ...mongoFilter, ...filter };
  }

  /**
   * Map MongoDB document to model object
   */
  private mapDocumentToModel(doc: any): T {
    if (!doc) return null as unknown as T;

    const { _id, ...data } = doc;

    return {
      ...data,
      id: _id.toString ? _id.toString() : _id,
    } as T;
  }
}
