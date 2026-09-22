import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { DisciplineEntity } from "./entities/discipline.entity";

@Injectable()
export class DisciplineService {
  constructor(
    @InjectRepository(DisciplineEntity)
    private readonly disciplines: Repository<DisciplineEntity>,
  ) {}

  findAll(orgId: string): Promise<DisciplineEntity[]> {
    return this.disciplines.find({
      where: { organizationId: orgId },
      order: { name: "ASC" },
    });
  }

  create(orgId: string, name: string): Promise<DisciplineEntity> {
    const discipline = this.disciplines.create({ organizationId: orgId, name });
    return this.disciplines.save(discipline);
  }

  async getOrFail(orgId: string, id: string): Promise<DisciplineEntity> {
    const discipline = await this.disciplines.findOneBy({
      id,
      organizationId: orgId,
    });
    if (!discipline) throw new NotFoundException("Discipline introuvable");
    return discipline;
  }
}
