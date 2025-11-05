import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';

const modelsDir = path.join(__dirname, '../../models');
let modelDefinitions: Map<string, any> = new Map();

const loadModels = async () => {
  try {
    const files = await fs.readdir(modelsDir);
    const newDefinitions = new Map();
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(modelsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const modelDef = JSON.parse(content);
        newDefinitions.set(modelDef.name, modelDef);
      }
    }
    modelDefinitions = newDefinitions;
    console.log('Model definitions loaded.');
  } catch (error) {
    console.error('Failed to load model definitions:', error);
  }
};

// Initial load
loadModels();

// Watch for changes
const watcher = chokidar.watch(modelsDir, {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('add', loadModels).on('change', loadModels).on('unlink', loadModels);


export const modelMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { modelName } = req.params;
  const modelDefinition = modelDefinitions.get(modelName);

  if (!modelDefinition) {
    return res.status(404).json({ error: 'Model not found' });
  }

  (req as any).modelDefinition = modelDefinition;
  next();
};
