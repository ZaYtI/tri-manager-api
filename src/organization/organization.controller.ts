import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { Paginate, PaginateQuery } from "nestjs-paginate";
import { AuthGuard, Roles } from "@thallesp/nestjs-better-auth";

@Controller("organizations")
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @Roles(["admin"])
  async findAll(@Paginate() query: PaginateQuery) {
    return this.organizationService.findAll(query);
  }

  @Post()
  @Roles(["admin"])
  async create(@Body() body: CreateOrganizationDto) {
    return this.organizationService.create(body.name, body.slug, body.ownerId);
  }

  @Get(":id")
  @Roles(["admin"])
  async findOne(@Param("id") id: string) {
    return this.organizationService.findOne(id);
  }
}
