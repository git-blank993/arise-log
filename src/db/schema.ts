import { pgTable, uuid, timestamp, varchar, integer, text, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const statCategoryEnum = pgEnum("stat_category", ["STR", "AGI", "VIT", "INT", "WIS", "GOLD"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  dailyLogs: many(dailyLogs),
}));

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  currentRank: varchar("current_rank").notNull(),
  staminaRemaining: integer("stamina_remaining").default(100).notNull(),
});

export const dailyLogsRelations = relations(dailyLogs, ({ many, one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  quests: many(dailyQuests),
  dungeonReports: many(dungeonReports),
  systemNotification: one(systemNotifications, {
    fields: [dailyLogs.id],
    references: [systemNotifications.logId]
  }),
}));

export const dailyQuests = pgTable("daily_quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id").references(() => dailyLogs.id, { onDelete: "cascade" }).notNull(),
  statCategory: statCategoryEnum("stat_category").notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  timeTakenMinutes: integer("time_taken_minutes"),
});

export const dailyQuestsRelations = relations(dailyQuests, ({ one }) => ({
  log: one(dailyLogs, {
    fields: [dailyQuests.logId],
    references: [dailyLogs.id],
  }),
}));

export const dungeonReports = pgTable("dungeon_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id").references(() => dailyLogs.id, { onDelete: "cascade" }).notNull(),
  statCategory: statCategoryEnum("stat_category").notNull(),
  reportData: jsonb("report_data").notNull(),
  timeTakenMinutes: integer("time_taken_minutes").notNull(),
});

export const dungeonReportsRelations = relations(dungeonReports, ({ one }) => ({
  log: one(dailyLogs, {
    fields: [dungeonReports.logId],
    references: [dailyLogs.id],
  }),
}));

export const systemNotifications = pgTable("system_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id").references(() => dailyLogs.id, { onDelete: "cascade" }).unique().notNull(),
  levelUpMoment: text("level_up_moment"),
  debuffsTaken: text("debuffs_taken"),
  nextDayObjective: text("next_day_objective"),
});

export const systemNotificationsRelations = relations(systemNotifications, ({ one }) => ({
  log: one(dailyLogs, {
    fields: [systemNotifications.logId],
    references: [dailyLogs.id],
  }),
}));
