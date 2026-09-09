import { OrganizationEntity } from "./entities/organization.entity";

export type OrganizationListItem = OrganizationEntity & {
  membersCount: number;
};
