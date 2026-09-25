CREATE TABLE `body_weight_samples` (
	`id` text PRIMARY KEY NOT NULL,
	`flock_id` text NOT NULL,
	`date` integer NOT NULL,
	`age_weeks` integer,
	`sample_size` integer NOT NULL,
	`avg_weight_g` real NOT NULL,
	`min_weight_g` real,
	`max_weight_g` real,
	`cv_percent` real,
	`target_cv_percent` real DEFAULT 12 NOT NULL,
	`raw_weights_g` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`flock_id`) REFERENCES `flocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `body_weight_samples_flock_date_idx` ON `body_weight_samples` (`flock_id`,`date`);--> statement-breakpoint
CREATE TABLE `daily_records` (
	`id` text PRIMARY KEY NOT NULL,
	`flock_id` text NOT NULL,
	`date` integer NOT NULL,
	`mortality_count` integer DEFAULT 0 NOT NULL,
	`mortality_cause` text,
	`egg_count` integer,
	`feed_consumed_kg` real,
	`water_consumed_liters` real,
	`temp_c` real,
	`humidity_pct` real,
	`notes` text,
	`recorded_by_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`flock_id`) REFERENCES `flocks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recorded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_records_flock_date_idx` ON `daily_records` (`flock_id`,`date`);--> statement-breakpoint
CREATE INDEX `daily_records_date_idx` ON `daily_records` (`date`);--> statement-breakpoint
CREATE TABLE `flocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`breed` text,
	`source` text,
	`housing_type` text,
	`placed_on` integer NOT NULL,
	`initial_count` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'WORKER' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `vaccination_records` (
	`id` text PRIMARY KEY NOT NULL,
	`flock_id` text NOT NULL,
	`date` integer NOT NULL,
	`vaccine_name` text NOT NULL,
	`method` text,
	`batch_number` text,
	`administered_by` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`flock_id`) REFERENCES `flocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vaccination_records_flock_date_idx` ON `vaccination_records` (`flock_id`,`date`);