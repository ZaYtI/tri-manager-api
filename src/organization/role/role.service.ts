import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { auth } from "~/auth/utils/auth";
import { orgRoleStatements } from "./config/access-control";
import { STATIC_ROLES } from "./config/static-roles";
import { OrganizationRoleEntity } from "./entities/organization-role.entity";
import { RolePermission } from "./dto/role.dto";
import { OrgRoleView } from "./role.types";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(OrganizationRoleEntity)
    private readonly customRoles: Repository<OrganizationRoleEntity>,
  ) {}

  catalog() {
    return { statements: orgRoleStatements };
  }

  async resolvePermission(
    orgId: string,
    roleName: string,
  ): Promise<RolePermission> {
    const staticRole = STATIC_ROLES.find((entry) => entry.role === roleName);
    if (staticRole) return staticRole.permission;

    const row = await this.customRoles.findOneBy({
      organizationId: orgId,
      role: roleName,
    });
    if (!row) return {};

    try {
      return JSON.parse(row.permission) as RolePermission;
    } catch {
      return {};
    }
  }

  async findAll(orgId: string, headers: Headers): Promise<OrgRoleView[]> {
    const custom = (await auth.api.listOrgRoles({
      query: { organizationId: orgId },
      headers,
    })) as { id: string; role: string; permission: RolePermission }[];

    return [
      ...STATIC_ROLES,
      ...custom.map((entry) => ({
        id: entry.id,
        role: entry.role,
        permission: entry.permission,
        system: false,
      })),
    ];
  }

  async findOne(
    orgId: string,
    roleName: string,
    headers: Headers,
  ): Promise<OrgRoleView> {
    const staticRole = STATIC_ROLES.find((entry) => entry.role === roleName);
    if (staticRole) return staticRole;

    const role = (await auth.api.getOrgRole({
      query: { organizationId: orgId, roleName },
      headers,
    })) as { id: string; role: string; permission: RolePermission };

    return {
      id: role.id,
      role: role.role,
      permission: role.permission,
      system: false,
    };
  }

  create(
    orgId: string,
    data: { role: string; permission: RolePermission },
    headers: Headers,
  ) {
    return auth.api.createOrgRole({
      body: {
        organizationId: orgId,
        role: data.role,
        permission: data.permission,
      },
      headers,
    });
  }

  update(
    orgId: string,
    roleName: string,
    permission: RolePermission,
    headers: Headers,
  ) {
    return auth.api.updateOrgRole({
      body: {
        organizationId: orgId,
        roleName,
        data: { permission },
      },
      headers,
    });
  }

  remove(orgId: string, roleName: string, headers: Headers) {
    return auth.api.deleteOrgRole({
      body: { organizationId: orgId, roleName },
      headers,
    });
  }
}
