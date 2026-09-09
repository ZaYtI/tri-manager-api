export interface OrgViewer {
  isAppAdmin: boolean;
  isImpersonating: boolean;
  role: string | null;
  permissions: Record<string, string[]>;
}
