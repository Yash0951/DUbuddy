import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../lib/db';

const modelsDir = path.join(__dirname, '../../models');

interface Field {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  relationTo?: string;
}

interface ModelDefinition {
  name: string;
  tableName: string;
  ownerField?: string;
  fields: Field[];
  rbac: Record<string, string[]>;
}

const typeMapping: Record<string, string> = {
  string: 'TEXT',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  datetime: 'TIMESTAMP',
  relation: 'TEXT', // Changed to TEXT for UUIDs
};

export const publishModel = async (req: Request, res: Response) => {
  const modelDefinition: ModelDefinition = req.body;

  try {
    // 1. Persist the model definition
    const filePath = path.join(modelsDir, `${modelDefinition.name}.json`);
    await fs.writeFile(filePath, JSON.stringify(modelDefinition, null, 2));

    // 2. Generate and execute the CREATE TABLE query
    let query = `CREATE TABLE IF NOT EXISTS "${modelDefinition.tableName}" (id TEXT PRIMARY KEY,`;

    const foreignKeys: string[] = [];

    for (const field of modelDefinition.fields) {
      const columnType = typeMapping[field.type];
      if (!columnType) {
        return res.status(400).json({ error: `Unsupported field type: ${field.type}` });
      }

      query += `"${field.name}" ${columnType}`;

      if (field.required) {
        query += ' NOT NULL';
      }
      if (field.unique) {
        query += ' UNIQUE';
      }

      query += ',';

      if (field.type === 'relation' && field.relationTo) {
        // Find the related model's table name (this is a simplified approach)
        try {
          const relatedModelPath = path.join(modelsDir, `${field.relationTo}.json`);
          const relatedModelContent = await fs.readFile(relatedModelPath, 'utf-8');
          const relatedModelDef: ModelDefinition = JSON.parse(relatedModelContent);
          foreignKeys.push(`FOREIGN KEY ("${field.name}") REFERENCES "${relatedModelDef.tableName}"(id)`);
        } catch (error) {
          console.warn(`Could not find related model definition for: ${field.relationTo}`);
        }
      }
    }

    query += foreignKeys.join(', ');
    query = query.replace(/,$/, '') + ');'; // Remove trailing comma and close parenthesis

    await prisma.$executeRawUnsafe(query);

    res.status(201).json({ message: 'Model published successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to publish model' });
  }
};
