import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseConfig } from "src/config/database";
import { DataSource } from "typeorm";

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const dbConfig = configService.getOrThrow<DatabaseConfig>("database");
          const dataSource = new DataSource({
            type: "postgres",
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            synchronize: true,
            entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
          });
          await dataSource.initialize();
          console.log("Database connected successfully");
          return dataSource;
        } catch (error) {
          console.log("Error connecting to database");
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}
