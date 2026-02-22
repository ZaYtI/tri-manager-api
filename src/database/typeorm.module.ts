import { Global, Module, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseConfig } from "src/config/database";
import { auth } from "src/utils/auth";
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
export class TypeOrmModule implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email = this.configService.getOrThrow<string>("ADMIN_EMAIL");
    const password = this.configService.getOrThrow<string>("ADMIN_PASSWORD");

    if (!email || !password) return;

    const existing = await this.dataSource.query<[{ id: number }]>(
      'SELECT id FROM "user" WHERE role = $1 LIMIT 1',
      ["admin"],
    );

    if (existing.length > 0) {
      console.log("Admin déjà existant, skip");
      return;
    }

    const { user } = (await auth.api.createUser({
      body: { email, password, name: "Admin", role: "admin" },
    })) as { user: { email: string } };

    console.log(`Admin créé : ${user.email}`);
  }
}
