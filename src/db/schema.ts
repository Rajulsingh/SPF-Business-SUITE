import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("WORKER"), // OWNER | MANAGER | WORKER
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const flocks = sqliteTable("flocks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  breed: text("breed"),
  source: text("source"), // supplier name, kept free-text and supplier-agnostic
  housingType: text("housing_type"), // OPEN_SIDED | ENVIRONMENT_CONTROLLED
  placedOn: integer("placed_on", { mode: "timestamp" }).notNull(),
  initialCount: integer("initial_count").notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE | ARCHIVED
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const dailyRecords = sqliteTable(
  "daily_records",
  {
    id: text("id").primaryKey(),
    flockId: text("flock_id")
      .notNull()
      .references(() => flocks.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    mortalityCount: integer("mortality_count").notNull().default(0),
    mortalityCause: text("mortality_cause"),
    eggCount: integer("egg_count"),
    feedConsumedKg: real("feed_consumed_kg"),
    waterConsumedLiters: real("water_consumed_liters"),
    tempC: real("temp_c"),
    humidityPct: real("humidity_pct"),
    notes: text("notes"),
    recordedById: text("recorded_by_id").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("daily_records_flock_date_idx").on(table.flockId, table.date),
    index("daily_records_date_idx").on(table.date),
  ]
);

export const bodyWeightSamples = sqliteTable(
  "body_weight_samples",
  {
    id: text("id").primaryKey(),
    flockId: text("flock_id")
      .notNull()
      .references(() => flocks.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    ageWeeks: integer("age_weeks"),
    sampleSize: integer("sample_size").notNull(),
    avgWeightG: real("avg_weight_g").notNull(),
    minWeightG: real("min_weight_g"),
    maxWeightG: real("max_weight_g"),
    cvPercent: real("cv_percent"),
    targetCvPercent: real("target_cv_percent").notNull().default(12),
    rawWeightsG: text("raw_weights_g"), // comma-separated individual weights, if entered
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("body_weight_samples_flock_date_idx").on(table.flockId, table.date)]
);

export const vaccinationRecords = sqliteTable(
  "vaccination_records",
  {
    id: text("id").primaryKey(),
    flockId: text("flock_id")
      .notNull()
      .references(() => flocks.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    vaccineName: text("vaccine_name").notNull(),
    method: text("method"), // IN_OVO | SPRAY | DRINKING_WATER | INJECTION | EYE_DROP
    batchNumber: text("batch_number"),
    administeredBy: text("administered_by"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("vaccination_records_flock_date_idx").on(table.flockId, table.date)]
);

export const flocksRelations = relations(flocks, ({ many }) => ({
  dailyRecords: many(dailyRecords),
  weightSamples: many(bodyWeightSamples),
  vaccinations: many(vaccinationRecords),
}));

export const dailyRecordsRelations = relations(dailyRecords, ({ one }) => ({
  flock: one(flocks, { fields: [dailyRecords.flockId], references: [flocks.id] }),
  recordedBy: one(users, { fields: [dailyRecords.recordedById], references: [users.id] }),
}));

export const bodyWeightSamplesRelations = relations(bodyWeightSamples, ({ one }) => ({
  flock: one(flocks, { fields: [bodyWeightSamples.flockId], references: [flocks.id] }),
}));

export const vaccinationRecordsRelations = relations(vaccinationRecords, ({ one }) => ({
  flock: one(flocks, { fields: [vaccinationRecords.flockId], references: [flocks.id] }),
}));
