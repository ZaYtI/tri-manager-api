import { auth } from "../../auth/utils/auth";
import {
  ORG_DEFAULT_MEMBER_ROLE,
  type OrgRoleName,
} from "../../organization/role/config/access-control";

export interface SeedUserInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  emailVerified?: boolean;
}

export async function createUser(input: SeedUserInput): Promise<string> {
  const res = (await auth.api.createUser({
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role ?? "user",
      data: { emailVerified: input.emailVerified ?? true },
    },
  })) as { user: { id: string } };
  return res.user.id;
}

export async function createOrganization(input: {
  name: string;
  slug: string;
  creatorId: string;
}): Promise<string> {
  const created = (await auth.api.createOrganization({
    body: { name: input.name, slug: input.slug, userId: input.creatorId },
  })) as { id: string } | null;

  if (!created) throw new Error(`Échec création organisation ${input.slug}`);
  return created.id;
}

export async function addMember(input: {
  userId: string;
  organizationId: string;
  role?: OrgRoleName;
}): Promise<string> {
  const member = (await auth.api.addMember({
    body: {
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role ?? ORG_DEFAULT_MEMBER_ROLE,
    },
  })) as { id: string } | null;

  if (!member) throw new Error(`Échec ajout membre ${input.userId}`);
  return member.id;
}

export async function ensureAdmin(dataSourceQuery: {
  query: (sql: string, params?: unknown[]) => Promise<unknown[]>;
}): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? "admin@monapp.com";
  const password = process.env.ADMIN_PASSWORD ?? "Password123!";

  const existing = await dataSourceQuery.query(
    'SELECT id FROM "user" WHERE role = $1 LIMIT 1',
    ["admin"],
  );
  if (existing.length > 0) {
    console.log("  Admin déjà présent, skip");
    return;
  }

  await createUser({ name: "Admin", email, password, role: "admin" });
  console.log(`  Admin : ${email} / ${password}`);
}
