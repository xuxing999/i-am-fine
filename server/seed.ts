import { storage } from "./storage";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seed() {
  const existingUser = await storage.getUserByUsername("elderly1");
  if (!existingUser) {
    console.log("Seeding database...");
    const password = await hashPassword("1234");
    
    await storage.createUser({
      username: "elderly1",
      password,
      displayName: "Grandma Lin",
      contact1Name: "Son (Tom)",
      contact1Phone: "0912345678",
      contact2Name: "Daughter (Mary)",
      contact2Phone: "0987654321",
    });
    
    console.log("Seeded user 'elderly1' with password '1234'");
  } else {
    console.log("Database already seeded");
  }
}

seed().catch(console.error);
