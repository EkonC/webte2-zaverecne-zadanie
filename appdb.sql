-- Adminer 5.2.1 PostgreSQL 15.13 dump

DROP TABLE IF EXISTS "alembic_version";
CREATE TABLE "public"."alembic_version" (
    "version_num" character varying(32) NOT NULL,
    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
) WITH (oids = false);

INSERT INTO "alembic_version" ("version_num") VALUES
('5da5a1593cfb');

DROP TABLE IF EXISTS "history";
DROP SEQUENCE IF EXISTS history_id_seq;
CREATE SEQUENCE history_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."history" (
    "id" integer DEFAULT nextval('history_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "action" character varying(50) NOT NULL,
    "source" character varying(15) NOT NULL,
    "city" character varying(64),
    "country" character varying(64),
    "timestamp" timestamp,
    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX ix_history_id ON public.history USING btree (id);

CREATE INDEX ix_history_timestamp ON public.history USING btree ("timestamp");

INSERT INTO "history" ("id", "user_id", "action", "source", "city", "country", "timestamp") VALUES
(3,	2,	'merge_pdf',	'api',	NULL,	NULL,	'2025-05-17 15:59:45.962904');

DROP TABLE IF EXISTS "roles";
DROP SEQUENCE IF EXISTS roles_id_seq;
CREATE SEQUENCE roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."roles" (
    "id" integer DEFAULT nextval('roles_id_seq') NOT NULL,
    "name" character varying,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX ix_roles_id ON public.roles USING btree (id);

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);

INSERT INTO "roles" ("id", "name") VALUES
(1,	'user'),
(2,	'admin');

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "email" character varying NOT NULL,
    "hashed_password" character varying NOT NULL,
    "is_active" boolean,
    "role_id" integer,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

CREATE INDEX ix_users_id ON public.users USING btree (id);

INSERT INTO "users" ("id", "email", "hashed_password", "is_active", "role_id") VALUES
(1,	'user@example.com',	'$2b$12$laPwDE9uBszr8u/te86H3uQBC5bincMH4d6hnQ8svFsxlCNWJVJSu',	'1',	1),
(2,	'admin@example.com',	'$2b$12$y3pO2CI73VlvqSPW.DkVLOsdazo2KsNd2llK/Ayxmva5We251Kita',	'1',	2),
(3,	'cyril.benacka@gmail.com',	'$2b$12$AX.46jGFsVnHF.7QjOLFkubWbiCLxaWRGoETbEPH04M5eeFt/MwbS',	'1',	1);

ALTER TABLE ONLY "public"."history" ADD CONSTRAINT "history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) NOT DEFERRABLE;

-- 2025-05-19 20:42:32 UTC
