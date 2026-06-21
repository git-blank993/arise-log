"use server";

import { db } from "@/db";
import { dailyLogs, dailyQuests, statLogs, eveningDebriefs } from "@/db/schema";
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
      statLogs: true,
      eveningDebrief: true,
    },
  });
}

export async function initializeDay(dateStr?: string, isRestDay: boolean = false, restReason?: string) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Get start and end of target day
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const existingLog = await db.query.dailyLogs.findFirst({
    where: and(
      eq(dailyLogs.userId, userId),
      gte(dailyLogs.date, startOfDay),
      lt(dailyLogs.date, startOfNextDay)
    ),
  });

  if (existingLog) {
    // If it exists, we can optionally update it to a rest day if requested?
    // But usually we just return it. Let's return it.
    return existingLog.id;
  }

  const [newLog] = await db.insert(dailyLogs).values({
    userId,
    date: startOfDay, // Ensure it's locked to that specific day
    currentRank: "E-Class",
    staminaRemaining: 100,
    isRestDay,
    restReason,
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

export async function addStatLog(logId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const statCategory = formData.get("statCategory") as string;
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

  const isPenalty = formData.get("isPenalty") === "true";

  await db.insert(statLogs).values({
    logId,
    statCategory,
    reportData,
    timeTakenMinutes,
    isPenalty,
  });

  revalidatePath("/");
}

export async function updateStatLog(reportId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const timeTakenMinutes = parseInt(formData.get("timeTakenMinutes") as string || "0", 10);
  
  const reportDataStr = formData.get("reportData") as string;
  let reportData = {};
  if (reportDataStr) {
    try {
      reportData = JSON.parse(reportDataStr);
    } catch (e) {
      throw new Error("Invalid report data format");
    }
  }

  await db.update(statLogs).set({
    timeTakenMinutes,
    reportData,
  }).where(eq(statLogs.id, reportId));

  revalidatePath("/");
}

export async function deleteStatLog(reportId: string) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(statLogs).where(eq(statLogs.id, reportId));
  revalidatePath("/");
}

export async function updateEveningDebrief(logId: string, formData: FormData) {
  const userId = await getSession();
  if (!userId) throw new Error("Unauthorized");

  const content = formData.get("content") as string;

  // Check if exists
  const existing = await db.query.eveningDebriefs.findFirst({
    where: eq(eveningDebriefs.logId, logId),
  });

  if (existing) {
    await db.update(eveningDebriefs).set({
      content,
    }).where(eq(eveningDebriefs.id, existing.id));
  } else {
    await db.insert(eveningDebriefs).values({
      logId,
      content,
    });
  }

  revalidatePath("/");
}
