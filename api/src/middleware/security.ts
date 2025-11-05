import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/db';

const getAction = (method: string) => {
  switch (method) {
    case 'POST': return 'create';
    case 'GET': return 'read';
    case 'PUT': return 'update';
    case 'DELETE': return 'delete';
    default: return '';
  }
};

export const rbacMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const modelDefinition = (req as any).modelDefinition;
  const action = getAction(req.method);

  const allowedActions = modelDefinition.rbac[user.role.name];

  if (!allowedActions || !allowedActions.includes(action)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

export const ownershipMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const modelDefinition = (req as any).modelDefinition;
  const { id } = req.params;

  if (user.role.name === 'Admin' || !modelDefinition.ownerField) {
    return next();
  }

  try {
    const record = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "${modelDefinition.tableName}" WHERE id = $1`,
      id
    );

    if (record.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record[0][modelDefinition.ownerField] !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Ownership check failed' });
  }
};
