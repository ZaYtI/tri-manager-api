import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { Roles } from "~/auth/role/decorators/role.decorator";
import { AuthGuard } from "~/auth/guards/auth.guard";

@Controller("organizations")
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @Roles("admin")
  async findAll() {
    return this.organizationService.findAll();
  }

  @Post()
  @Roles("admin")
  async create(@Body() body: CreateOrganizationDto) {
    return this.organizationService.create(body.name, body.slug, body.ownerId);
  }
}
