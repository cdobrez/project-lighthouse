CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cook_id` text NOT NULL,
	`meal_id` text NOT NULL,
	`qty` integer DEFAULT 1 NOT NULL,
	`day` text NOT NULL,
	`fulfillment` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`tip_percent` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_ordered_on` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cook_id`) REFERENCES `cooks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subscriptions_user_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_cook_idx` ON `subscriptions` (`cook_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_day_idx` ON `subscriptions` (`day`);