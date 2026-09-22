import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { Paginate, PaginateQuery } from "nestjs-paginate";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { CurrentActor } from "~/audit/current-actor.decorator";
import { AuditActor } from "~/audit/audit.types";
import { TrainingService } from "./training.service";
import { CreateTrainingDto } from "./dto/create-training.dto";
import { UpdateTrainingDto } from "./dto/update-training.dto";
import { CancelTrainingDto } from "./dto/cancel-training.dto";

@Controller("organizations/:orgId/sessions")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @RequireOrgPermission({ training: ["create"] })
  create(
    @Param("orgId") orgId: string,
    @Body() createTrainingDto: CreateTrainingDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.trainingService.create(orgId, createTrainingDto, actor);
  }

  @Get()
  @RequireOrgPermission({ training: [] })
  findAll(@Param("orgId") orgId: string, @Paginate() query: PaginateQuery) {
    return this.trainingService.findAll(orgId, query);
  }

  @Get(":id")
  @RequireOrgPermission({ training: [] })
  findOne(@Param("orgId") orgId: string, @Param("id") id: string) {
    return this.trainingService.findOne(orgId, id);
  }

  @Patch(":id")
  @RequireOrgPermission({ training: ["update"] })
  update(
    @Param("orgId") orgId: string,
    @Param("id") id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.trainingService.update(orgId, id, updateTrainingDto, actor);
  }

  @Post(":id/cancel")
  @RequireOrgPermission({ training: ["cancel"] })
  cancel(
    @Param("orgId") orgId: string,
    @Param("id") id: string,
    @Body() cancelTrainingDto: CancelTrainingDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.trainingService.cancel(orgId, id, cancelTrainingDto, actor);
  }

  @Delete(":id")
  @RequireOrgPermission({ training: ["delete"] })
  remove(
    @Param("orgId") orgId: string,
    @Param("id") id: string,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.trainingService.remove(orgId, id, actor);
  }
}
