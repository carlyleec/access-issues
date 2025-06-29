CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"organization_id" uuid NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"organization_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issue_actions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"referenced_issue_id" uuid,
	"action" varchar(256) NOT NULL,
	"text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issue_assignees" (
	"issue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "issue_assignees_issue_id_user_id_pk" PRIMARY KEY("issue_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "issue_upvotes" (
	"issue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"type" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"text" text NOT NULL,
	"severity" varchar(256) NOT NULL,
	"bolt_or_anchor" varchar(256),
	"bolt_type" varchar(256),
	"bolt_number" integer,
	"bolt_issue" varchar(256),
	"organization_id" uuid NOT NULL,
	"area_id" uuid,
	"crag_id" uuid,
	"wall_id" uuid,
	"route_id" uuid,
	"created_by_id" uuid,
	"closed_at" timestamp,
	"closed_by_id" uuid,
	"closed_reason" varchar(10),
	"state" varchar(10) DEFAULT 'open' NOT NULL,
	"flagged_at" timestamp,
	"flagged_reason" timestamp,
	"num_upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"content_type" varchar(256) NOT NULL,
	"url" text NOT NULL,
	"issue_id" uuid NOT NULL,
	"issue_action_id" uuid,
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
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"grade" varchar(256) NOT NULL,
	"wall_id" uuid NOT NULL,
	"type" varchar(256) NOT NULL,
	"status" varchar(256),
	"anchor_type" varchar(256) NOT NULL,
	"is_2_bolt_anchor" boolean DEFAULT false NOT NULL,
	"num_bolts" integer DEFAULT 0 NOT NULL,
	"num_pins" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"bolt_types" text[] DEFAULT '{}'::text[] NOT NULL,
	"organization_id" uuid NOT NULL,
	"last_worked_on_at" timestamp,
	"last_worked_on_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "taggings" (
	"tag_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	"crag_id" uuid NOT NULL,
	"wall_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
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
CREATE TABLE "walls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"organization_id" uuid NOT NULL,
	"crag_id" uuid NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crags" ADD CONSTRAINT "crags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crags" ADD CONSTRAINT "crags_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_actions" ADD CONSTRAINT "issue_actions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_actions" ADD CONSTRAINT "issue_actions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_actions" ADD CONSTRAINT "issue_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_actions" ADD CONSTRAINT "issue_actions_referenced_issue_id_issues_id_fk" FOREIGN KEY ("referenced_issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_upvotes" ADD CONSTRAINT "issue_upvotes_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_upvotes" ADD CONSTRAINT "issue_upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_crag_id_crags_id_fk" FOREIGN KEY ("crag_id") REFERENCES "public"."crags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "public"."walls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_issue_action_id_issue_actions_id_fk" FOREIGN KEY ("issue_action_id") REFERENCES "public"."issue_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "public"."walls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_last_worked_on_by_users_id_fk" FOREIGN KEY ("last_worked_on_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_crag_id_crags_id_fk" FOREIGN KEY ("crag_id") REFERENCES "public"."crags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "public"."walls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggings" ADD CONSTRAINT "taggings_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walls" ADD CONSTRAINT "walls_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walls" ADD CONSTRAINT "walls_crag_id_crags_id_fk" FOREIGN KEY ("crag_id") REFERENCES "public"."crags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "areas_name_idx" ON "areas" USING btree ("name");--> statement-breakpoint
CREATE INDEX "areas_organization_id_idx" ON "areas" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "crags_name_idx" ON "crags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "crags_organization_id_idx" ON "crags" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "crags_area_id_idx" ON "crags" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "issue_actions_organization_id_idx" ON "issue_actions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "issue_actions_issue_id_idx" ON "issue_actions" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "issue_actions_user_id_idx" ON "issue_actions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "issue_actions_referenced_issue_id_idx" ON "issue_actions" USING btree ("referenced_issue_id");--> statement-breakpoint
CREATE INDEX "issue_assignees_issue_id_idx" ON "issue_assignees" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "issue_assignees_user_id_idx" ON "issue_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_assignees_issue_id_user_id_unique" ON "issue_assignees" USING btree ("issue_id","user_id");--> statement-breakpoint
CREATE INDEX "issues_number_idx" ON "issues" USING btree ("number");--> statement-breakpoint
CREATE INDEX "issues_title_idx" ON "issues" USING btree ("title");--> statement-breakpoint
CREATE INDEX "issues_state_idx" ON "issues" USING btree ("state");--> statement-breakpoint
CREATE INDEX "issues_area_id_idx" ON "issues" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "issues_crag_id_idx" ON "issues" USING btree ("crag_id");--> statement-breakpoint
CREATE INDEX "issues_wall_id_idx" ON "issues" USING btree ("wall_id");--> statement-breakpoint
CREATE INDEX "issues_organization_id_idx" ON "issues" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "issue_media_issue_id_idx" ON "media" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "routes_name_idx" ON "routes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "routes_organization_id_idx" ON "routes" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name","organization_id","type");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tags_organization_id_idx" ON "tags" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_organization_id_idx" ON "users_to_organizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_user_id_idx" ON "users_to_organizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "walls_name_idx" ON "walls" USING btree ("name");--> statement-breakpoint
CREATE INDEX "walls_organization_id_idx" ON "walls" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "walls_crag_id_idx" ON "walls" USING btree ("crag_id");