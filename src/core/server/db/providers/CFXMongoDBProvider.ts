import { DBProviders } from "@/core/shared/interfaces/DBConfig";
import { IBaseModel } from "@rtf/shared/interfaces/IBaseModel";
import { IRepository } from "@rtf/shared/interfaces/IRepository";
import { log } from "console";

export class CFXMongoDBProvider<T extends IBaseModel>
  implements IRepository<T>
{
  private collectionName: string;
  private resourceName: string = "cfx-mongodb";

  constructor(collectionName: string, resourceName: string = "cfx-mongodb") {
    this.collectionName = collectionName;
    this.resourceName = resourceName;
    if (GetResourceState("cfx-mongodb") !== "started") {
      console.error(
        `[MongoDB-Provider] Error: cfx-mongodb resource is not started.`
      );
    }
  }
  /**
   * Check if a document with given ID exists
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const filter = { $or: [{ _id: id }, { id: id }] };

      const count = await exports[this.resourceName].count(
        this.collectionName,
        filter
      );

      return count > 0;
    } catch (error) {
      console.error(
        `[MongoDB-Provider] Error checking if document ${id} exists:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find a document by ID
   */
  public async findById(id: string): Promise<T | null> {
    try {
      const result = await exports[this.resourceName].findOne(
        this.collectionName,
        { _id: id }
      );

      if (!result || !result.success || !result.data) {
        return null;
      }

      return this.mapDocumentToModel(result.data);
    } catch (error) {
      console.error(
        `[MongoDB-Provider] Error finding document by ID ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find all documents matching a filter
   */
  public async findAll(filter: Partial<T>): Promise<T[]> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      const response = await exports[this.resourceName].findAll(
        this.collectionName,
        mongoFilter
      );
      if (!response || !response.success || !response.data) {
        return [];
      }
      return Array.isArray(response.data)
        ? response.data.map((doc: any) => this.mapDocumentToModel(doc))
        : [];
    } catch (error) {
      console.error("[MongoDB-Provider] Error finding documents:", error);
      throw error;
    }
  }

  /**
   * Find a single document matching a filter
   */
  public async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      const response = await exports[this.resourceName].find(
        this.collectionName,
        mongoFilter
      );

      if (!response || !response.success || !response.data) {
        return null;
      }

      // Sicherstellen, dass response.data eine _id hat
      if (response.data && !response.data._id && response.data.id) {
        response.data._id = response.data.id;
      }

      return this.mapDocumentToModel(response.data);
    } catch (error) {
      console.error("[MongoDB-Provider] Error finding document:", error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  public async insert(
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    try {
      const now = new Date();
      const doc = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = await exports[this.resourceName].insert(
        this.collectionName,
        doc
      );

      if (!result || !result.success) {
        throw new Error("Failed to insert document");
      }

      return this.mapDocumentToModel({
        _id: result.insertedId,
        ...doc,
      });
    } catch (error) {
      console.error("[MongoDB-Provider] Error creating document:", error);
      throw error;
    }
  }

  /**
   * Update a document by ID
   */
  public async update(
    id: string,
    data: Partial<T>,
    returnDoc: boolean = false
  ): Promise<T | boolean | null> {
    try {
      const { id: _, createdAt: __, ...updateData } = data as any;

      const updateDoc = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      const result = await exports[this.resourceName].update(
        this.collectionName,
        { _id: id },
        updateDoc
      );

      if (result && result.success && result.modifiedCount > 0) {
        if (returnDoc) {
          return await this.findById(id);
        }
        return true;
      }

      return null;
    } catch (error) {
      console.error(`[MongoDB-Provider] Error updating document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  /**
   * Delete a document by ID
   */
  public async delete(id: string): Promise<boolean> {
    try {
      // Erstelle den Filter mit ID
      const filter = { _id: id };

      // Versuch, das Dokument zu löschen
      const result = await exports[this.resourceName].delete(
        this.collectionName,
        filter
      );
      console.log("Collection:", this.collectionName);
      console.log(
        `[MongoDB-Provider] Trying to delete document with ID: ${id}`
      );
      console.log(`[MongoDB-Provider] Filter used:`, { _id: id });
      // Prüfe auf Erfolg und Fehler
      if (!result) {
        console.error(
          `[MongoDB-Provider] Error deleting document ${id}: Keine Antwort vom Provider`
        );
        return false;
      }

      if (!result.success) {
        console.error(
          `[MongoDB-Provider] Error deleting document ${id}: ${
            result.error || "Unbekannter Fehler"
          }`
        );
        return false;
      }

      // Erfolg nur, wenn genau ein Dokument gelöscht wurde
      if (result.deletedCount === 1) {
        console.log(`[MongoDB-Provider] Document ${id} deleted successfully`);
        return true;
      }

      // Falls kein oder mehrere Dokumente gelöscht wurden
      console.warn(
        `[MongoDB-Provider] Warning: ${
          result.deletedCount || 0
        } documents deleted with ID ${id}`
      );
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`[MongoDB-Provider] Error deleting document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Count documents matching a filter
   */
  public async count(filter: Partial<T> = {}): Promise<number> {
    try {
      const mongoFilter = this.prepareFilter(filter);
      const result = await exports[this.resourceName].count(
        this.collectionName,
        mongoFilter
      );
      console.log(
        `[MongoDB-Provider] Count result: ${result.data} documents found`
      );
      return result.data || 0;
    } catch (error) {
      console.error("[MongoDB-Provider] Error counting documents:", error);
      throw error;
    }
  }

  /**
   * Prepare filter for MongoDB query
   */
  private prepareFilter(filter: Partial<T>): Record<string, any> {
    const mongoFilter: Record<string, any> = {};

    if ((filter as any).id) {
      mongoFilter._id = (filter as any).id;
      delete (filter as any).id;
    }

    return { ...mongoFilter, ...filter };
  }

  /**
   * Map MongoDB document to model object
   */
  private mapDocumentToModel(doc: any): T {
    if (!doc) return null as unknown as T;

    let id: string | null = null;

    if (doc._id) {
      if (typeof doc._id === "string") {
        id = doc._id;
      } else if (doc._id.toString && typeof doc._id.toString === "function") {
        id = doc._id.toString();
      } else if (doc._id.$oid) {
        id = doc._id.$oid;
      }
    } else if (doc.id) {
      if (typeof doc.id === "string") {
        id = doc.id;
      } else if (doc.id.toString && typeof doc.id.toString === "function") {
        id = doc.id.toString();
      }
    }

    const { _id, id: docId, ...data } = doc;

    const result = {
      ...data,
      id: id || null,
    } as T;
    return result;
  }
  getConnection(): any {
    return null;
  }

  getProvider(): DBProviders {
    return "cfxmongodb";
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getDatabase(): any {
    return null;
  }
  getConfig(): any {
    return null;
  }
  getRepository<T extends IBaseModel>(modelName: string): IRepository<T> {
    return new CFXMongoDBProvider<T>(modelName, this.resourceName);
  }
  connect(): Promise<boolean> {
    return Promise.resolve(true);
  }
  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}
