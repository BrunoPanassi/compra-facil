CREATE TYPE "public"."user_role" AS ENUM('CLIENT', 'ADMIN', 'SERVICE_PROVIDER', 'STORE_OWNER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"telefone" text NOT NULL,
	"senha" text NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "users_telefone_unique" UNIQUE("telefone")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"nr" integer NOT NULL,
	"neighbr" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lon" numeric(10, 7) NOT NULL,
	"owner_id" integer NOT NULL,
	"description" text,
	"cellphone" text NOT NULL,
	"cellphone_second" text,
	"email" text,
	"facebook" text,
	"instagram" text,
	"another" text
);
--> statement-breakpoint
CREATE TABLE "material_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"weight" numeric(12, 3),
	"type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"desc" text,
	"material_id" integer NOT NULL,
	"images" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_store" integer NOT NULL,
	"id_product" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "product_stores_price_non_negative" CHECK ("product_stores"."price" >= 0),
	CONSTRAINT "product_stores_quantity_non_negative" CHECK ("product_stores"."quantity" >= 0)
);
--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_type_id_material_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."material_types"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_stores" ADD CONSTRAINT "product_stores_id_store_stores_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_stores" ADD CONSTRAINT "product_stores_id_product_products_id_fk" FOREIGN KEY ("id_product") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "stores_owner_id_idx" ON "stores" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "materials_type_id_idx" ON "materials" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "products_material_id_idx" ON "products" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "product_stores_id_store_idx" ON "product_stores" USING btree ("id_store");--> statement-breakpoint
CREATE INDEX "product_stores_id_product_idx" ON "product_stores" USING btree ("id_product");--> statement-breakpoint
CREATE UNIQUE INDEX "product_stores_store_product_uidx" ON "product_stores" USING btree ("id_store","id_product");