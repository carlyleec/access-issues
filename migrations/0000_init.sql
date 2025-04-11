CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"organization_id" uuid NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(256),
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reactions" jsonb,
	"flagged_at" timestamp,
	"flagged_reason" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"area_id" uuid,
	"created_by_id" uuid NOT NULL,
	"closed_at" timestamp,
	"closed_by_id" uuid,
	"closed_reason" varchar(10),
	"state" varchar(10) DEFAULT 'open' NOT NULL,
	"flagged_at" timestamp,
	"flagged_reason" timestamp,
	"num_comments" integer DEFAULT 0 NOT NULL,
	"assignee_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"reactions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"num_issues" integer DEFAULT 0 NOT NULL,
	"donate_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"color" varchar(7) NOT NULL,
	"type" varchar(256) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_organizations" (
	"role" varchar(256),
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "areas_name_idx" ON "areas" USING btree ("name");--> statement-breakpoint
CREATE INDEX "areas_organization_id_idx" ON "areas" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "areas_tags_idx" ON "areas" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "comments_organization_id_idx" ON "comments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "comments_issue_id_idx" ON "comments" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "issues_number_idx" ON "issues" USING btree ("number");--> statement-breakpoint
CREATE INDEX "issues_title_idx" ON "issues" USING btree ("title");--> statement-breakpoint
CREATE INDEX "issues_state_idx" ON "issues" USING btree ("state");--> statement-breakpoint
CREATE INDEX "issues_area_id_idx" ON "issues" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "issues_organization_id_idx" ON "issues" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "issues_tags_idx" ON "issues" USING btree ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name","organization_id","type");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tags_organization_id_idx" ON "tags" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_organization_id_idx" ON "users_to_organizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_user_id_idx" ON "users_to_organizations" USING btree ("user_id");