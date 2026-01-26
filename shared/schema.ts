import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),

  // Emergency Contacts
  contact1Name: text("contact1_name"),
  contact1Phone: text("contact1_phone"),
  contact2Name: text("contact2_name"),
  contact2Phone: text("contact2_phone"),

  // Status
  lastCheckInAt: timestamp("last_check_in_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),

  // Threshold Settings
  timeoutThreshold: integer("timeout_threshold").notNull().default(86400), // 預設 24 小時
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  lastCheckInAt: true,
  createdAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Public Status Response (safe to share)
export type PublicStatusResponse = {
  displayName: string;
  lastCheckInAt: string | null; // serialized date
  isSafe: boolean;
};

// Check-in Response
export type CheckInResponse = {
  success: boolean;
  timestamp: string;
};
