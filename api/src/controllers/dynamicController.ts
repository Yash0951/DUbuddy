import { Request, Response } from 'express';
import prisma from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const getModel = (req: Request) => (req as any).modelDefinition;

export const createRecord = async (req: Request, res: Response) => {
  const { tableName, fields } = getModel(req);
  const data = req.body;
  data.id = uuidv4();

  // Basic validation
  for (const field of fields) {
    if (field.required && !data[field.name]) {
      return res.status(400).json({ error: `Missing required field: ${field.name}` });
    }
  }

  const columns = Object.keys(data).map(k => `"${k}"`).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`,
      ...values
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record' });
  }
};

export const getRecords = async (req: Request, res: Response) => {
  const { tableName } = getModel(req);
  try {
    const records = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

export const getRecordById = async (req: Request, res: Response) => {
  const { tableName } = getModel(req);
  const { id } = req.params;
  try {
    const record = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" WHERE id = $1`, id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch record' });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  const { tableName } = getModel(req);
  const { id } = req.params;
  const data = req.body;

  const updates = Object.keys(data).map((k, i) => `"${k}" = $${i + 2}`).join(', ');

  try {
    const result = await prisma.$queryRawUnsafe(
      `UPDATE "${tableName}" SET ${updates} WHERE id = $1 RETURNING *`,
      id, ...Object.values(data)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  const { tableName } = getModel(req);
  const { id } = req.params;

  try {
    await prisma.$queryRawUnsafe(`DELETE FROM "${tableName}" WHERE id = $1`, id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
};
