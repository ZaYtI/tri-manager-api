import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LocationModule } from "./location/location.module";
import { DisciplineModule } from "./discipline/discipline.module";
import { TrainingEntity } from "./entities/training.entity";
import { TrainingCoachEntity } from "./entities/training-coach.entity";
import { TrainingTeamEntity } from "./entities/training-team.entity";
import { TrainingService } from "./training.service";
import { TrainingController } from "./training.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingEntity,
      TrainingCoachEntity,
      TrainingTeamEntity,
    ]),
    LocationModule,
    DisciplineModule,
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
