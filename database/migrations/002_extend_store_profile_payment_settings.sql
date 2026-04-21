-- Extend Store profile information
ALTER TABLE Store
  ADD COLUMN bio TEXT NULL,
  ADD COLUMN address TEXT NULL;

-- Employee relation table for Store
CREATE TABLE IF NOT EXISTS Employee (
  id VARCHAR(191) NOT NULL,
  storeId VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NULL,
  phone VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  INDEX Employee_storeId_createdAt_idx (storeId, createdAt),
  CONSTRAINT Employee_storeId_fkey
    FOREIGN KEY (storeId) REFERENCES Store(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- One-to-one payment settings table per Store
CREATE TABLE IF NOT EXISTS PaymentSettings (
  id VARCHAR(191) NOT NULL,
  storeId VARCHAR(191) NOT NULL,
  ewalletNumber VARCHAR(191) NULL,
  bankAccount VARCHAR(191) NULL,
  qrisImageUrl TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX PaymentSettings_storeId_key (storeId),
  CONSTRAINT PaymentSettings_storeId_fkey
    FOREIGN KEY (storeId) REFERENCES Store(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
