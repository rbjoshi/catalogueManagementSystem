-- ============================================================
-- V1__initial_schema.sql
-- Catalogue Management System - Complete Schema
-- ent_id pattern: "e-" + 32 random alphanumeric chars
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENTERPRISE
-- ============================================================
CREATE TABLE enterprise (
    ent_id       VARCHAR(35) PRIMARY KEY,           -- "e-" + 32 chars
    name         VARCHAR(255)        NOT NULL,
    domain       VARCHAR(255)        UNIQUE,
    plan         VARCHAR(50)         NOT NULL DEFAULT 'FREE',  -- FREE | BASIC | PRO | ENTERPRISE
    logo_url     TEXT,
    address      TEXT,
    phone        VARCHAR(30),
    email        VARCHAR(255),
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enterprise_domain ON enterprise(domain);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    user_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ent_id       VARCHAR(35)         NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    username     VARCHAR(100)        NOT NULL,
    email        VARCHAR(255)        NOT NULL,
    password_hash VARCHAR(255)       NOT NULL,
    first_name   VARCHAR(100),
    last_name    VARCHAR(100),
    role         VARCHAR(30)         NOT NULL DEFAULT 'VIEWER',  -- OWNER | ADMIN | EDITOR | VIEWER
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    last_login   TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, email),
    UNIQUE (ent_id, username)
);

CREATE INDEX idx_users_ent_id    ON users(ent_id);
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_username  ON users(username);

-- ============================================================
-- ITEM TYPE (normalised)
-- ============================================================
CREATE TABLE item_type (
    type_id      SERIAL PRIMARY KEY,
    ent_id       VARCHAR(35)         NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    name         VARCHAR(150)        NOT NULL,
    description  TEXT,
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, name)
);

CREATE INDEX idx_item_type_ent ON item_type(ent_id);

-- ============================================================
-- ITEM SUB TYPE (normalised, belongs to type)
-- ============================================================
CREATE TABLE item_sub_type (
    sub_type_id  SERIAL PRIMARY KEY,
    type_id      INTEGER             NOT NULL REFERENCES item_type(type_id) ON DELETE CASCADE,
    ent_id       VARCHAR(35)         NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    name         VARCHAR(150)        NOT NULL,
    description  TEXT,
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, type_id, name)
);

CREATE INDEX idx_item_sub_type_ent     ON item_sub_type(ent_id);
CREATE INDEX idx_item_sub_type_type_id ON item_sub_type(type_id);

-- ============================================================
-- ITEM SIZE (normalised)
-- ============================================================
CREATE TABLE item_size (
    size_id      SERIAL PRIMARY KEY,
    ent_id       VARCHAR(35)         NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    label        VARCHAR(100)        NOT NULL,  -- e.g. "XL", "250ml", "A4"
    unit         VARCHAR(50),                  -- e.g. "ml", "cm", "kg"
    sort_order   INTEGER             NOT NULL DEFAULT 0,
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, label)
);

CREATE INDEX idx_item_size_ent ON item_size(ent_id);

-- ============================================================
-- ITEM BRAND / COMPANY (normalised)
-- ============================================================
CREATE TABLE item_brand (
    brand_id     SERIAL PRIMARY KEY,
    ent_id       VARCHAR(35)         NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    name         VARCHAR(200)        NOT NULL,
    logo_url     TEXT,
    website      VARCHAR(255),
    is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, name)
);

CREATE INDEX idx_item_brand_ent ON item_brand(ent_id);

-- ============================================================
-- ITEMS (main item table)
-- ============================================================
CREATE TABLE items (
    item_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ent_id          VARCHAR(35)      NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    sku             VARCHAR(100),
    name            VARCHAR(500)     NOT NULL,
    description     TEXT,
    short_desc      VARCHAR(500),
    price           NUMERIC(15, 2),
    mrp             NUMERIC(15, 2),
    currency        VARCHAR(10)      NOT NULL DEFAULT 'INR',
    discount_pct    NUMERIC(5, 2)    DEFAULT 0,
    type_id         INTEGER          REFERENCES item_type(type_id)     ON DELETE SET NULL,
    sub_type_id     INTEGER          REFERENCES item_sub_type(sub_type_id) ON DELETE SET NULL,
    size_id         INTEGER          REFERENCES item_size(size_id)     ON DELETE SET NULL,
    brand_id        INTEGER          REFERENCES item_brand(brand_id)   ON DELETE SET NULL,
    weight          NUMERIC(10, 3),
    weight_unit     VARCHAR(20),
    dimensions      VARCHAR(100),
    color           VARCHAR(100),
    material        VARCHAR(200),
    country_origin  VARCHAR(100),
    barcode         VARCHAR(100),
    images          JSONB            NOT NULL DEFAULT '[]',  -- [{url, isPrimary, sortOrder}]
    tags            JSONB            NOT NULL DEFAULT '[]',  -- ["tag1", "tag2"]
    attributes      JSONB            NOT NULL DEFAULT '{}',  -- custom key-value pairs
    stock_qty       INTEGER          DEFAULT 0,
    is_active       BOOLEAN          NOT NULL DEFAULT TRUE,
    created_by      UUID             REFERENCES users(user_id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (ent_id, sku)
);

CREATE INDEX idx_items_ent_id      ON items(ent_id);
CREATE INDEX idx_items_type_id     ON items(type_id);
CREATE INDEX idx_items_sub_type_id ON items(sub_type_id);
CREATE INDEX idx_items_brand_id    ON items(brand_id);
CREATE INDEX idx_items_sku         ON items(ent_id, sku);
CREATE INDEX idx_items_name        ON items USING gin (to_tsvector('english', name));
CREATE INDEX idx_items_is_active   ON items(ent_id, is_active);

-- ============================================================
-- CATALOGUE TEMPLATES
-- ============================================================
CREATE TABLE catalogue_templates (
    template_id    SERIAL PRIMARY KEY,
    name           VARCHAR(200)     NOT NULL,
    description    TEXT,
    thumbnail_url  TEXT,
    layout_config  JSONB            NOT NULL DEFAULT '{}',  -- default layout settings
    page_size      VARCHAR(20)      NOT NULL DEFAULT 'A4',  -- A4 | A3 | LETTER
    is_system      BOOLEAN          NOT NULL DEFAULT TRUE,
    is_active      BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATALOGUES
-- ============================================================
CREATE TABLE catalogues (
    cat_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ent_id         VARCHAR(35)      NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    user_id        UUID             NOT NULL REFERENCES users(user_id),
    template_id    INTEGER          REFERENCES catalogue_templates(template_id) ON DELETE SET NULL,
    name           VARCHAR(500)     NOT NULL,
    description    TEXT,
    layout_json    JSONB            NOT NULL DEFAULT '{}',  -- full designer state
    page_size      VARCHAR(20)      NOT NULL DEFAULT 'A4',
    orientation    VARCHAR(20)      NOT NULL DEFAULT 'PORTRAIT',
    status         VARCHAR(30)      NOT NULL DEFAULT 'DRAFT',  -- DRAFT | PUBLISHED | ARCHIVED
    cover_image    TEXT,
    item_count     INTEGER          NOT NULL DEFAULT 0,
    version        INTEGER          NOT NULL DEFAULT 1,
    published_at   TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalogues_ent_id  ON catalogues(ent_id);
CREATE INDEX idx_catalogues_user_id ON catalogues(user_id);
CREATE INDEX idx_catalogues_status  ON catalogues(ent_id, status);

-- ============================================================
-- CATALOGUE ITEMS (junction)
-- ============================================================
CREATE TABLE catalogue_items (
    cat_item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id           UUID             NOT NULL REFERENCES catalogues(cat_id) ON DELETE CASCADE,
    item_id          UUID             NOT NULL REFERENCES items(item_id)     ON DELETE CASCADE,
    page_number      INTEGER          NOT NULL DEFAULT 1,
    position         INTEGER          NOT NULL DEFAULT 0,
    custom_name      VARCHAR(500),
    custom_price     NUMERIC(15, 2),
    custom_desc      TEXT,
    custom_overrides JSONB            NOT NULL DEFAULT '{}',  -- any per-catalogue overrides
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (cat_id, item_id)
);

CREATE INDEX idx_catalogue_items_cat_id  ON catalogue_items(cat_id);
CREATE INDEX idx_catalogue_items_item_id ON catalogue_items(item_id);

-- ============================================================
-- PDF JOBS (async PDF generation tracking)
-- ============================================================
CREATE TABLE pdf_jobs (
    job_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id       UUID             NOT NULL REFERENCES catalogues(cat_id) ON DELETE CASCADE,
    ent_id       VARCHAR(35)      NOT NULL REFERENCES enterprise(ent_id) ON DELETE CASCADE,
    requested_by UUID             REFERENCES users(user_id),
    status       VARCHAR(30)      NOT NULL DEFAULT 'PENDING',  -- PENDING | PROCESSING | DONE | FAILED
    file_url     TEXT,
    error_msg    TEXT,
    started_at   TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pdf_jobs_cat_id ON pdf_jobs(cat_id);
CREATE INDEX idx_pdf_jobs_status ON pdf_jobs(status);

-- ============================================================
-- SEED DATA: catalogue templates
-- ============================================================
INSERT INTO catalogue_templates (name, description, page_size, layout_config, is_system) VALUES
('Grid 2x3', 'Classic 2-column, 3-row product grid', 'A4',
 '{"columns":2,"rows":3,"showPrice":true,"showSku":false,"showDescription":true,"itemSpacing":16,"padding":32}',
 true),
('Grid 3x4', 'Dense 3-column, 4-row product grid', 'A4',
 '{"columns":3,"rows":4,"showPrice":true,"showSku":true,"showDescription":false,"itemSpacing":12,"padding":24}',
 true),
('Feature Showcase', 'One hero item per page with full details', 'A4',
 '{"columns":1,"rows":1,"showPrice":true,"showSku":true,"showDescription":true,"itemSpacing":0,"padding":48}',
 true),
('Price List', 'Compact tabular price list', 'A4',
 '{"columns":1,"rows":10,"showPrice":true,"showSku":true,"showDescription":false,"itemSpacing":8,"padding":24,"listView":true}',
 true);
