export class CreateOrganizationDto {
  name: string;
  slug: string;
  ownerId: string;
}

export class UpdateOrganizationDto {
  name?: string;
  slug?: string;
  active?: boolean;
}
