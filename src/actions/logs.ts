"use server";

import { db } from "@/db";
import { dailyLogs, dailyQuests, dungeonReports, systemNotifications } from "@/db/schema";
import { getSession } from "./auth";
import { desc, eq, and, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getDailyLogs() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.userId, userId),
    orderBy: [desc(dailyLogs.date)],
    with: {
      quests: true,
      dungeonReports: true,
      systemNotification: true,
    },
  });
}

export async function initializeDay() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Get start and end of today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const existingLog = await db.query.dailyLogs.findFirst({
    where: and(
      eq(dailyLogs.userId, userId),
      gte(dailyLogs.date, startOfDay),
      lt(dailyLogs.date, startOfNextDay)
    ),
  });

  if (existingLog) {
    return existingLog.id;
  }

  const [newLog] = await db.insert(dailyLogs).values({
    userId,
    currentRank: "E-Class", // Will be calculated on the fly in UI
    staminaRemaining: 100,
  }).returning();

  revalidatePath("/");
  return newLog.id;
}

export async function addQuest(logId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const statCategory = formData.get("statCategory") as "STR" | "AGI" | "VIT" | "INT" | "WIS" | "GOLD";
  const description = formData.get("description") as string;

  if (!description || !statCategory) throw new Error("Missing fields");

  await db.insert(dailyQuests).values({
    logId,
    statCategory,
    description,
    isCompleted: false,
  });

  revalidatePath("/");
}

export async function toggleQuest(questId: string, isCompleted: boolean) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  await db.update(dailyQuests)
    .set({ isCompleted })
    .where(eq(dailyQuests.id, questId));

  revalidatePath("/");
}

export async function deleteQuest(questId: string) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(dailyQuests).where(eq(dailyQuests.id, questId));
  revalidatePath("/");
}

export async function addDungeonReport(logId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const statCategory = formData.get("statCategory") as "STR" | "AGI" | "VIT" | "INT" | "WIS" | "GOLD";
  const timeTakenMinutes = parseInt(formData.get("timeTakenMinutes") as string || "0", 10);
  
  // Extract custom fields from the formData based on dynamic inputs
  const reportDataStr = formData.get("reportData") as string;
  let reportData = {};
  if (reportDataStr) {
    try {
      reportData = JSON.parse(reportDataStr);
    } catch (e) {
      throw new Error("Invalid report data format");
    }
  }

  if (!statCategory) throw new Error("Missing stat category");

  await db.insert(dungeonReports).values({
    logId,
    statCategory,
    reportData,
    timeTakenMinutes,
  });

  revalidatePath("/");
}

export async function deleteDungeonReport(reportId: string) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(dungeonReports).where(eq(dungeonReports.id, reportId));
  revalidatePath("/");
}

export async function updateSystemNotifications(logId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const levelUpMoment = formData.get("levelUpMoment") as string;
  const debuffsTaken = formData.get("debuffsTaken") as string;
  const nextDayObjective = formData.get("nextDayObjective") as string;

  // Check if exists
  const existing = await db.query.systemNotifications.findFirst({
    where: eq(systemNotifications.logId, logId),
  });

  if (existing) {
    await db.update(systemNotifications).set({
      levelUpMoment,
      debuffsTaken,
      nextDayObjective,
    }).where(eq(systemNotifications.id, existing.id));
  } else {
    await db.insert(systemNotifications).values({
      logId,
      levelUpMoment,
      debuffsTaken,
      nextDayObjective,
    });
  }

  revalidatePath("/");
}
