CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"currency" varchar(10) NOT NULL,
	"rate" numeric(10, 6) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "net_worth_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"date" varchar(10) NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"on_chain_assets" jsonb,
	"cex_assets" jsonb,
	"bank_assets" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "net_worth_records" ADD CONSTRAINT "net_worth_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;