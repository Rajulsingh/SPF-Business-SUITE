-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Flock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "source" TEXT,
    "housingType" TEXT,
    "placedOn" DATETIME NOT NULL,
    "initialCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mortalityCount" INTEGER NOT NULL DEFAULT 0,
    "mortalityCause" TEXT,
    "eggCount" INTEGER,
    "feedConsumedKg" REAL,
    "waterConsumedLiters" REAL,
    "tempC" REAL,
    "humidityPct" REAL,
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyWeightSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "ageWeeks" INTEGER,
    "sampleSize" INTEGER NOT NULL,
    "avgWeightG" REAL NOT NULL,
    "minWeightG" REAL,
    "maxWeightG" REAL,
    "cvPercent" REAL,
    "targetCvPercent" REAL NOT NULL DEFAULT 12,
    "rawWeightsG" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BodyWeightSample_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VaccinationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "method" TEXT,
    "batchNumber" TEXT,
    "administeredBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VaccinationRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "DailyRecord_date_idx" ON "DailyRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_flockId_date_key" ON "DailyRecord"("flockId", "date");

-- CreateIndex
CREATE INDEX "BodyWeightSample_flockId_date_idx" ON "BodyWeightSample"("flockId", "date");

-- CreateIndex
CREATE INDEX "VaccinationRecord_flockId_date_idx" ON "VaccinationRecord"("flockId", "date");
