import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const allowedRoles = ["BUYER", "SELLER"];
    const userRole = allowedRoles.includes(role) ? role : "BUYER";

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: userRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
};

// GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            quotations: true,
          },
        },
      },
    });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const updates: Record<string, string> = {};

    if (name) updates.name = name;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: "Current password required" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      const isValid = await bcrypt.compare(currentPassword, user!.passwordHash);
      if (!isValid) {
        res.status(400).json({ error: "Current password incorrect" });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    res.json({ user });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
