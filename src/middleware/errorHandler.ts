import { Request, Response, NextFunction } from 'express';
import { IErrorHandler, IApiResponse } from '../types';

export class ErrorHandler implements IErrorHandler {

  errorHandler(error: Error, req: Request, res: Response, _next: NextFunction): void {
    console.error('Error Handler:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const statusCode = this.getStatusCode(error);
    const message = this.getErrorMessage(error);

    const response: IApiResponse = {
      success: false,
      message,
      error: process.env['NODE_ENV'] === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  }

  notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
    const response: IApiResponse = {
      success: false,
      message: `Rota ${req.method} ${req.url} não encontrada`,
      timestamp: new Date().toISOString()
    };

    res.status(404).json(response);
  }

  jsonErrorHandler(error: Error, _req: Request, res: Response, next: NextFunction): void {
    if (error instanceof SyntaxError && 'body' in error) {
      const response: IApiResponse = {
        success: false,
        message: 'JSON inválido no corpo da requisição',
        error: process.env['NODE_ENV'] === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      };

      res.status(400).json(response);
      return;
    }

    next(error);
  }

  private getStatusCode(error: Error): number {
    // Erros de validação
    if (error.message.includes('inválido') || 
        error.message.includes('obrigatório') ||
        error.message.includes('deve ser')) {
      return 400;
    }

    // Erros de não encontrado
    if (error.message.includes('não encontrada') || 
        error.message.includes('não encontrado')) {
      return 404;
    }

    // Erros de conflito
    if (error.message.includes('possui transações') ||
        error.message.includes('já existe')) {
      return 409;
    }

    // Erros de validação de negócio
    if (error.message.includes('Saldo insuficiente') ||
        error.message.includes('não pode ser negativo')) {
      return 422;
    }

    // Erros de sintaxe JSON
    if (error instanceof SyntaxError) {
      return 400;
    }

    // Erro interno do servidor (padrão)
    return 500;
  }

  private getErrorMessage(error: Error): string {
    // Se já tem uma mensagem clara, usa ela
    if (error.message && !error.message.includes('TypeORM')) {
      return error.message;
    }

    // Mensagens padrão baseadas no tipo de erro
    if (error instanceof SyntaxError) {
      return 'Dados inválidos na requisição';
    }

    if (error.message.includes('TypeORM')) {
      return 'Erro no banco de dados';
    }

    // Mensagem genérica para erros internos
    return 'Erro interno do servidor';
  }
}

// Instância singleton do ErrorHandler
export const errorHandler = new ErrorHandler(); 