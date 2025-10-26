import { Column, PrimaryColumn } from "typeorm";
import { GlobalSecondaryIndex } from "typeorm-dynamodb";
import { Entity } from "../utils/db";

@Entity()
@GlobalSecondaryIndex({
  name: "email",
  partitionKey: "email",
})
@GlobalSecondaryIndex({
  name: "type",
  partitionKey: "type",
  sortKey: "lastSignIn",
})
export class User {
  @PrimaryColumn()
  id?: string;

  @Column()
  email?: string;

  @Column()
  code?: string;

  @Column()
  lastCodeTime?: string;

  @Column()
  type?: "atendente" | "vendedor" | "administrador";

  @Column()
  name?: string;

  @Column()
  lastSignIn?: string;

  @Column({ type: "string" })
  saleIds?: string[];
}
