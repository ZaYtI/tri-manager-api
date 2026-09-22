import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { LocationEntity } from "./entities/location.entity";

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
  ) {}

  findAll(orgId: string): Promise<LocationEntity[]> {
    return this.locations.find({
      where: { organizationId: orgId },
      order: { name: "ASC" },
    });
  }

  create(
    orgId: string,
    name: string,
    address?: string,
  ): Promise<LocationEntity> {
    const location = this.locations.create({
      organizationId: orgId,
      name,
      address: address ?? null,
    });
    return this.locations.save(location);
  }

  async getOrFail(orgId: string, id: string): Promise<LocationEntity> {
    const location = await this.locations.findOneBy({
      id,
      organizationId: orgId,
    });
    if (!location) throw new NotFoundException("Lieu introuvable");
    return location;
  }
}
