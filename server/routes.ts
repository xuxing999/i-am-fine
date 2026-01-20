import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  const { hashPassword } = setupAuth(app);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json(null); // Return null instead of 401 for "not logged in" state
    }
    res.json(req.user);
  });

  // User Routes
  app.put(api.user.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.user.updateProfile.input.parse(req.body);
      const updatedUser = await storage.updateUser(req.user!.id, input);
      res.json(updatedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.user.checkIn.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const updatedUser = await storage.checkIn(req.user!.id);
    res.json({ success: true, timestamp: updatedUser.lastCheckInAt!.toISOString() });
  });

  // Public Routes
  app.get(api.public.status.path, async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Logic for "isSafe": check-in within last 24 hours
    const now = new Date();
    const lastCheckIn = user.lastCheckInAt ? new Date(user.lastCheckInAt) : null;
    const isSafe = lastCheckIn 
      ? (now.getTime() - lastCheckIn.getTime()) < 24 * 60 * 60 * 1000 
      : false;

    res.json({
      displayName: user.displayName,
      lastCheckInAt: user.lastCheckInAt ? user.lastCheckInAt.toISOString() : null,
      isSafe,
    });
  });

  return httpServer;
}

import passport from "passport";
