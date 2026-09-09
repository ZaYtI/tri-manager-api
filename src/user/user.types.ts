export interface UserOrganizationMembership {
  memberId: string;
  role: string;
  joinedAt: Date;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}
