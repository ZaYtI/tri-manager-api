import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DisciplineEntity } from "./entities/discipline.entity";
import { DisciplineService } from "./discipline.service";
import { DisciplineController } from "./discipline.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DisciplineEntity])],
  controllers: [DisciplineController],
  providers: [DisciplineService],
  exports: [DisciplineService],
})
export class DisciplineModule {}
