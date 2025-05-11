import { DbConfig, DBProviders } from './DBConfig';
import { IBaseModel } from './IBaseModel';
import { IRepository } from './IRepository';

export interface IDatabaseProvider {
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    getConnection(): Promise<any>;
    getProvider(): DBProviders;
    isConnected(): Promise<boolean>;
    getConfig(): DbConfig;
     getRepository<T extends IBaseModel>(modelName: string): IRepository<T>;
}