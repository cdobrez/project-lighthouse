CREATE TABLE `cooks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`slug` text NOT NULL,
	`tagline` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`kitchen_story` text DEFAULT '' NOT NULL,
	`neighborhood` text NOT NULL,
	`zip` text NOT NULL,
	`specialties` text DEFAULT '[]' NOT NULL,
	`fulfillment` text DEFAULT '["pickup"]' NOT NULL,
	`delivery_radius_miles` real DEFAULT 3 NOT NULL,
	`food_handler_certified` integer DEFAULT false NOT NULL,
	`kitchen_inspected` integer DEFAULT false NOT NULL,
	`years_cooking` integer DEFAULT 1 NOT NULL,
	`image_key` text DEFAULT 'cook-default' NOT NULL,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`meals_served` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cooks_slug_unique` ON `cooks` (`slug`);--> statement-breakpoint
CREATE INDEX `cooks_zip_idx` ON `cooks` (`zip`);--> statement-breakpoint
CREATE INDEX `cooks_user_idx` ON `cooks` (`user_id`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`meal_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `favorites_user_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`cook_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`story` text DEFAULT '' NOT NULL,
	`cuisine` text NOT NULL,
	`price_cents` integer NOT NULL,
	`servings` integer DEFAULT 1 NOT NULL,
	`dietary_tags` text DEFAULT '[]' NOT NULL,
	`ingredients` text DEFAULT '[]' NOT NULL,
	`allergens` text DEFAULT '[]' NOT NULL,
	`image_key` text DEFAULT 'meal-default' NOT NULL,
	`available_days` text DEFAULT '[]' NOT NULL,
	`ready_window` text DEFAULT '5:00 - 7:00 pm' NOT NULL,
	`portions_available` integer DEFAULT 10 NOT NULL,
	`fulfillment` text DEFAULT '["pickup"]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`times_ordered` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`cook_id`) REFERENCES `cooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meals_slug_unique` ON `meals` (`slug`);--> statement-breakpoint
CREATE INDEX `meals_cook_idx` ON `meals` (`cook_id`);--> statement-breakpoint
CREATE INDEX `meals_status_idx` ON `meals` (`status`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`meal_id` text NOT NULL,
	`title` text NOT NULL,
	`qty` integer NOT NULL,
	`unit_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cook_id` text NOT NULL,
	`status` text DEFAULT 'placed' NOT NULL,
	`fulfillment` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`scheduled_for` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`fee_cents` integer DEFAULT 0 NOT NULL,
	`delivery_cents` integer DEFAULT 0 NOT NULL,
	`tip_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_ref` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cook_id`) REFERENCES `cooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_cook_idx` ON `orders` (`cook_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`neighborhood` text NOT NULL,
	`kind` text DEFAULT 'post' NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`event_at` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `posts_neighborhood_idx` ON `posts` (`neighborhood`);--> statement-breakpoint
CREATE TABLE `replies` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `replies_post_idx` ON `replies` (`post_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cook_id` text NOT NULL,
	`meal_id` text,
	`order_id` text,
	`rating` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cook_id`) REFERENCES `cooks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reviews_meal_idx` ON `reviews` (`meal_id`);--> statement-breakpoint
CREATE INDEX `reviews_cook_idx` ON `reviews` (`cook_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`zip` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`avatar_hue` integer DEFAULT 20 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);