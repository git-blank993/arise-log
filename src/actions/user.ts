"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const userId = await getSession();
  if (!userId) return null;

  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function allocateStatPoint(formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const statCategory = formData.get("statCategory") as string;
  if (!statCategory) throw new Error("Missing stat category");

  switch (statCategory) {
    case "STR": 
      await db.update(users).set({ strPoints: sql`${users.strPoints} + 1` }).where(eq(users.id, userId));
      break;
    case "AGI": 
      await db.update(users).set({ agiPoints: sql`${users.agiPoints} + 1` }).where(eq(users.id, userId));
      break;
    case "VIT": 
      await db.update(users).set({ vitPoints: sql`${users.vitPoints} + 1` }).where(eq(users.id, userId));
      break;
    case "INT": 
      await db.update(users).set({ intPoints: sql`${users.intPoints} + 1` }).where(eq(users.id, userId));
      break;
    case "WIS": 
      await db.update(users).set({ wisPoints: sql`${users.wisPoints} + 1` }).where(eq(users.id, userId));
      break;
    case "GOLD": 
      await db.update(users).set({ goldPoints: sql`${users.goldPoints} + 1` }).where(eq(users.id, userId));
      break;
    default: throw new Error("Invalid stat category");
  }

  revalidatePath("/profile");
}
