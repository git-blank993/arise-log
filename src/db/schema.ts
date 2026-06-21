import { pgTable, uuid, timestamp, varchar, integer, text, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const statCategoryEnum = pgEnum("stat_category", ["STR", "AGI", "VIT", "INT", "WIS", "GOLD"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  strPoints: integer("str_points").default(0).notNull(),
  agiPoints: integer("agi_points").default(0).notNull(),
  vitPoints: integer("vit_points").default(0).notNull(),
  intPoints: integer("int_points").default(0).notNull(),
  wisPoints: integer("wis_points").default(0).notNull(),
  goldPoints: integer("gold_points").default(0).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  dailyLogs: many(dailyLogs),
}));

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  currentRank: varchar("current_rank").default("E-Class"),
  staminaRemaining: integer("stamina_remaining").default(100),
});

export const dailyLogsRelations = relations(dailyLogs, ({ many, one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  quests: many(dailyQuests),
  statLogs: many(statLogs),
  eveningDebrief: one(eveningDebriefs),
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

export const statLogs = pgTable("stat_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id").references(() => dailyLogs.id, { onDelete: "cascade" }).notNull(),
  statCategory: varchar("stat_category").notNull(),
  timeTakenMinutes: integer("time_taken_minutes").notNull().default(0),
  reportData: jsonb("report_data"),
});

export const statLogsRelations = relations(statLogs, ({ one }) => ({
  dailyLog: one(dailyLogs, {
    fields: [statLogs.logId],
    references: [dailyLogs.id],
  }),
}));

export const eveningDebriefs = pgTable("evening_debriefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id").references(() => dailyLogs.id, { onDelete: "cascade" }).unique().notNull(),
  content: text("content"),
});

export const eveningDebriefsRelations = relations(eveningDebriefs, ({ one }) => ({
  dailyLog: one(dailyLogs, {
    fields: [eveningDebriefs.logId],
    references: [dailyLogs.id],
  }),
}));
