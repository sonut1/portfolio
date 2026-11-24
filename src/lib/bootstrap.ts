import { prisma } from "./prisma";
import { DEFAULT_PROFILE_DATA } from "./defaults";
import { hashPassword } from "./auth";

let bootstrapPromise: Promise<void> | null = null;

async function runBootstrap(): Promise<void> {
  const existingProfile = await prisma.siteProfile.findUnique({
    where: { id: "default" },
  });

  if (!existingProfile) {
    await prisma.siteProfile.create({
      data: DEFAULT_PROFILE_DATA,
    });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@sanjanapandey.in").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@2026!";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: "Sanjana Pandey",
        passwordHash: hashPassword(adminPassword),
      },
    });
  }
}

export async function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  await bootstrapPromise;
}
