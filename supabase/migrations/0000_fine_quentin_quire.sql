CREATE TYPE "public"."stat_category" AS ENUM('STR', 'AGI', 'VIT', 'INT', 'WIS', 'GOLD');--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"current_rank" varchar NOT NULL,
	"stamina_remaining" integer DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_id" uuid NOT NULL,
	"stat_category" "stat_category" NOT NULL,
	"description" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_id" uuid NOT NULL,
	"stat_category" "stat_category" NOT NULL,
	"topic" varchar NOT NULL,
	"details" text NOT NULL,
	"time_taken_minutes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_id" uuid NOT NULL,
	"level_up_moment" text,
	"debuffs_taken" text,
	"next_day_objective" text,
	CONSTRAINT "system_notifications_log_id_unique" UNIQUE("log_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_quests" ADD CONSTRAINT "daily_quests_log_id_daily_logs_id_fk" FOREIGN KEY ("log_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dungeon_reports" ADD CONSTRAINT "dungeon_reports_log_id_daily_logs_id_fk" FOREIGN KEY ("log_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_notifications" ADD CONSTRAINT "system_notifications_log_id_daily_logs_id_fk" FOREIGN KEY ("log_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;