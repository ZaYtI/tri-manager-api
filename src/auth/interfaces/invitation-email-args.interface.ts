export interface InvitationEmailArgs {
  id: string;
  email: string;
  organization: { name: string };
  inviter: { user: { name?: string | null; email: string } };
}
