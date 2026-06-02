import { NextFunction, Request, Response } from 'express';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof Error) {
    response.status(400).json({
      message: error.message
    });
    return;
  }

  response.status(500).json({
    message: 'Error inesperado'
  });
};