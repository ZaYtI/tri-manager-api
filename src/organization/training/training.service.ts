import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { AuditService } from "~/audit/audit.service";
import { AUDIT_ACTIONS } from "~/audit/audit.constants";
import { AuditActor } from "~/audit/audit.types";
import { TrainingEntity } from "./entities/training.entity";
import { CreateTrainingDto } from "./dto/create-training.dto";
import { UpdateTrainingDto } from "./dto/update-training.dto";
import { CancelTrainingDto } from "./dto/cancel-training.dto";

const TRAINING_RELATIONS = ["location", "discipline", "coaches", "teams"];

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingEntity)
    private readonly trainings: Repository<TrainingEntity>,
    private readonly audit: AuditService,
  ) {}

  async create(
    orgId: string,
    dto: CreateTrainingDto,
    actor?: AuditActor,
  ): Promise<TrainingEntity> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.assertValidRange(startsAt, endsAt);

    const training = this.trainings.create({
      organizationId: orgId,
      locationId: dto.locationId ?? null,
      disciplineId: dto.disciplineId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      startsAt,
      endsAt,
      recurrenceRule: dto.recurrenceRule ?? null,
      status: "scheduled",
    });
    await this.trainings.save(training);

    const coachIds =
      dto.coachIds && dto.coachIds.length > 0
        ? dto.coachIds
        : actor?.id
          ? [actor.id]
          : [];
    await this.setCoaches(training.id, coachIds);
    await this.setTeams(training.id, dto.teamIds ?? []);

    await this.audit.record({
      action: AUDIT_ACTIONS.TRAINING_CREATED,
      actor,
      targetType: "training",
      targetId: training.id,
      targetLabel: training.title,
      organizationId: orgId,
    });

    return this.findOne(orgId, training.id);
  }

  findAll(
    orgId: string,
    query: PaginateQuery,
  ): Promise<Paginated<TrainingEntity>> {
    const qb = this.trainings
      .createQueryBuilder("training")
      .where("training.organizationId = :orgId", { orgId });

    return paginate(query, qb, {
      relations: TRAINING_RELATIONS,
      sortableColumns: ["startsAt", "endsAt", "title", "createdAt"],
      searchableColumns: ["title"],
      filterableColumns: { status: true, disciplineId: true, locationId: true },
      defaultSortBy: [["startsAt", "ASC"]],
    });
  }

  async findOne(orgId: string, id: string): Promise<TrainingEntity> {
    return this.getOrFail(orgId, id);
  }

  async update(
    orgId: string,
    id: string,
    dto: UpdateTrainingDto,
    actor?: AuditActor,
  ): Promise<TrainingEntity> {
    const training = await this.getOrFail(orgId, id);
    if (training.status === "cancelled") {
      throw new BadRequestException("Cette séance est annulée");
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : training.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : training.endsAt;
    this.assertValidRange(startsAt, endsAt);

    Object.assign(training, {
      title: dto.title ?? training.title,
      description: dto.description ?? training.description,
      locationId: dto.locationId ?? training.locationId,
      disciplineId: dto.disciplineId ?? training.disciplineId,
      recurrenceRule: dto.recurrenceRule ?? training.recurrenceRule,
      startsAt,
      endsAt,
    });
    await this.trainings.save(training);

    if (dto.coachIds !== undefined) {
      await this.setCoaches(training.id, dto.coachIds);
    }
    if (dto.teamIds !== undefined) {
      await this.setTeams(training.id, dto.teamIds);
    }

    await this.audit.record({
      action: AUDIT_ACTIONS.TRAINING_UPDATED,
      actor,
      targetType: "training",
      targetId: training.id,
      targetLabel: training.title,
      organizationId: orgId,
    });

    return this.findOne(orgId, training.id);
  }

  async cancel(
    orgId: string,
    id: string,
    dto: CancelTrainingDto,
    actor?: AuditActor,
  ): Promise<TrainingEntity> {
    const training = await this.getOrFail(orgId, id);
    if (training.status === "cancelled") {
      throw new BadRequestException("Cette séance est déjà annulée");
    }

    training.status = "cancelled";
    training.cancelledAt = new Date();
    training.cancelReason = dto.reason ?? null;
    await this.trainings.save(training);

    await this.audit.record({
      action: AUDIT_ACTIONS.TRAINING_CANCELLED,
      actor,
      targetType: "training",
      targetId: training.id,
      targetLabel: training.title,
      organizationId: orgId,
      metadata: { reason: dto.reason ?? null },
    });

    return training;
  }

  async remove(orgId: string, id: string, actor?: AuditActor): Promise<void> {
    const training = await this.getOrFail(orgId, id);
    await this.trainings.delete({ id: training.id });

    await this.audit.record({
      action: AUDIT_ACTIONS.TRAINING_DELETED,
      actor,
      targetType: "training",
      targetId: training.id,
      targetLabel: training.title,
      organizationId: orgId,
    });
  }

  private async getOrFail(orgId: string, id: string): Promise<TrainingEntity> {
    const training = await this.trainings.findOne({
      where: { id, organizationId: orgId },
      relations: TRAINING_RELATIONS,
    });
    if (!training) throw new NotFoundException("Séance introuvable");
    return training;
  }

  private async setCoaches(
    trainingId: string,
    coachIds: string[],
  ): Promise<void> {
    await this.trainings.manager.query(
      `DELETE FROM "training_coach" WHERE "trainingId" = $1`,
      [trainingId],
    );
    if (coachIds.length === 0) return;
    await this.trainings
      .createQueryBuilder()
      .relation(TrainingEntity, "coaches")
      .of(trainingId)
      .add([...new Set(coachIds)]);
  }

  private async setTeams(trainingId: string, teamIds: string[]): Promise<void> {
    await this.trainings.manager.query(
      `DELETE FROM "training_team" WHERE "trainingId" = $1`,
      [trainingId],
    );
    if (teamIds.length === 0) return;
    await this.trainings
      .createQueryBuilder()
      .relation(TrainingEntity, "teams")
      .of(trainingId)
      .add([...new Set(teamIds)]);
  }

  private assertValidRange(startsAt: Date, endsAt: Date): void {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException("Dates de séance invalides");
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException(
        "La date de fin doit être postérieure à la date de début",
      );
    }
  }
}
