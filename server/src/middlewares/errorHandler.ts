import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof UniqueConstraintError) {
    response.status(409).json({
      message: 'Ya existe un registro con los mismos datos. Verifica que no haya duplicados.'
    });
    return;
  }

  if (error instanceof Error) {
    const status = error.name === 'SequelizeForeignKeyConstraintError' ? 400 : 500;
    response.status(status).json({
      message: error.message
    });
    return;
  }

  response.status(500).json({
    message: 'Error inesperado'
  });
};