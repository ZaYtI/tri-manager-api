import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import type { SeederOptions } from "typeorm-extension";

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number.parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: ["error", "migration", "schema"],
  entities: [`${__dirname}/../**/*.domain-entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: "typeorm_migrations",
  seeds: [`${__dirname}/seeding/seeds/*.seeder{.ts,.js}`],
  factories: [`${__dirname}/seeding/factories/*.factory{.ts,.js}`],
};

export const dataSource = new DataSource(options);
