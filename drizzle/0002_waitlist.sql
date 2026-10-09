CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`zip` text DEFAULT '' NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`wants_to_cook` integer DEFAULT false NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
