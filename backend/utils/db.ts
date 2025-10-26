import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "http";
import { Entity as ORMEntity } from "typeorm";
import {
  PagingAndSortingRepository,
  datasourceManager,
  getRepository as getRep,
} from "typeorm-dynamodb";

// array to collect all entities
export const entities: any[] = [];

// wrapper of Entity decorator to collect all entities
export const Entity: typeof ORMEntity =
  (...args: any[]) =>
  (target: any) => {
    entities.push(target);
    return ORMEntity(...args)(target);
  };

// map from entity class to repository
const repositories: Omit<Map<any, any>, "get" | "set"> & {
  get<T>(
    key: new (...args: any[]) => T,
  ): Promise<PagingAndSortingRepository<T>>;
  set<T>(
    key: new (...args: any[]) => T,
    value: Promise<PagingAndSortingRepository<T>>,
  ): void;
} = new Map();

const PRODUCTION = process.env.npm_lifecycle_event !== "start";

// get repository for an entity class
export const getRepository = async <T>(entity: new (...args: any[]) => T) => {
  if (!repositories.has(entity)) {
    // only open the repository if it's not already in the map
    repositories.set(
      entity,
      datasourceManager
        .open({
          entities,
          // use local DynamoDB unless AWS_DYNAMODB is set
          clientConfig:
            !PRODUCTION && !process.env.AWS_DYNAMODB
              ? {
                  endpoint: "http://localhost:8000",
                  region: "local",
                  credentials: {
                    accessKeyId: "dummy",
                    secretAccessKey: "dummy",
                  },
                  // local DynamoDB is slow sometimes, so this
                  // increases the connection timeout
                  requestHandler: new NodeHttpHandler({
                    httpAgent: new Agent({
                      keepAlive: true,
                    }),
                    connectionTimeout: 300000,
                    socketTimeout: 300000,
                  }),
                }
              : {},
          // synchronize schema only if SYNC is set
          synchronize: !!process.env.SYNC,
        })
        .then(() => getRep(entity)),
    );
    if (process.env.SYNC) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      delete process.env.SYNC;
    }
  }
  return repositories.get(entity);
};
