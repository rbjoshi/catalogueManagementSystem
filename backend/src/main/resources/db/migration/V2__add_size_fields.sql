-- V2__add_size_fields.sql
-- Add decimal_value and size_list to item_size table

ALTER TABLE item_size
ADD COLUMN decimal_value NUMERIC(15, 2),
ADD COLUMN size_list JSONB NOT NULL DEFAULT '[]';
