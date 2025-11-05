import { Request, Response } from 'express';
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  const { email, password, roleName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // Seed initial roles if they don't exist
      await prisma.role.createMany({
        data: [{ name: 'Admin' }, { name: 'Manager' }, { name: 'Viewer' }],
        skipDuplicates: true,
      });
      const newRole = await prisma.role.findUnique({ where: { name: roleName } });
      if (!newRole) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }
      const newUser = await prisma.user.create({
        data: { email, password: hashedPassword, roleId: newRole.id },
      });
      return res.status(201).json(newUser);
    }

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, roleId: role.id },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'User registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, roleName: user.role.name }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
