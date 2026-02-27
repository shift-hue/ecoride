ALTER TABLE users
    ADD COLUMN vehicle_model   VARCHAR(100) NULL,
    ADD COLUMN vehicle_number  VARCHAR(30)  NULL,
    ADD COLUMN bio             VARCHAR(500) NULL,
    ADD COLUMN preferences     VARCHAR(200) NULL,
    ADD COLUMN phone_number    VARCHAR(20)  NULL,
    ADD COLUMN phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN license_verified BOOLEAN NOT NULL DEFAULT FALSE;
