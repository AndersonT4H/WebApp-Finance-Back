import { Request, Response } from 'express';
import { ITransactionController, ITransactionService, IApiResponse } from '../types';

export class TransactionController implements ITransactionController {
  constructor(private transactionService: ITransactionService) {}

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transactionData = req.body;
      const transaction = await this.transactionService.createTransaction(transactionData);
      
      const response: IApiResponse = {
        success: true,
        message: 'Transação criada com sucesso',
        data: transaction
      };
      
      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao criar transação');
    }
  }

  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        ...(req.query['accountId'] ? { accountId: parseInt(req.query['accountId'] as string) } : {}),
        ...(req.query['type'] ? { type: req.query['type'] as any } : {}),
        ...(req.query['startDate'] ? { startDate: req.query['startDate'] as string } : {}),
        ...(req.query['endDate'] ? { endDate: req.query['endDate'] as string } : {})
      };

      const transactions = await this.transactionService.getAllTransactions(filters);
      
      const response: IApiResponse = {
        success: true,
        data: transactions
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar transações');
    }
  }

  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      const transaction = await this.transactionService.getTransactionById(parseInt(id));
      
      const response: IApiResponse = {
        success: true,
        data: transaction
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar transação');
    }
  }

  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      const updateData = req.body;
      const transaction = await this.transactionService.updateTransaction(parseInt(id), updateData);
      
      const response: IApiResponse = {
        success: true,
        message: 'Transação atualizada com sucesso',
        data: transaction
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao atualizar transação');
    }
  }

  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      await this.transactionService.deleteTransaction(parseInt(id));
      
      const response: IApiResponse = {
        success: true,
        message: 'Transação removida com sucesso'
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao remover transação');
    }
  }

  async createTransfer(req: Request, res: Response): Promise<void> {
    try {
      const transferData = req.body;
      const transaction = await this.transactionService.createTransfer(transferData);
      
      const response: IApiResponse = {
        success: true,
        message: 'Transferência realizada com sucesso',
        data: transaction
      };
      
      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao realizar transferência');
    }
  }

  async getTransactionsByAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      if (!accountId) throw new Error('accountId é obrigatório');
      const transactions = await this.transactionService.getTransactionsByAccount(parseInt(accountId));
      
      const response: IApiResponse = {
        success: true,
        data: transactions
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar transações da conta');
    }
  }

  async getTransactionStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        ...(req.query['accountId'] ? { accountId: parseInt(req.query['accountId'] as string) } : {}),
        ...(req.query['type'] ? { type: req.query['type'] as any } : {}),
        ...(req.query['startDate'] ? { startDate: req.query['startDate'] as string } : {}),
        ...(req.query['endDate'] ? { endDate: req.query['endDate'] as string } : {})
      };

      const statistics = await this.transactionService.getTransactionStatistics(filters);
      
      const response: IApiResponse = {
        success: true,
        data: statistics
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar estatísticas das transações');
    }
  }

  private handleError(res: Response, error: Error, defaultMessage: string): void {
    console.error('TransactionController Error:', error);
    
    const statusCode = this.getStatusCode(error);
    const message = error.message || defaultMessage;
    
    const response: IApiResponse = {
      success: false,
      message,
      ...(process.env['NODE_ENV'] === 'development' && error.stack ? { error: error.stack } : {})
    };
    
    res.status(statusCode).json(response);
  }

  private getStatusCode(error: Error): number {
    if (error.message.includes('não encontrada') || error.message.includes('não encontrado')) {
      return 404;
    }
    
    if (error.message.includes('inválido') || error.message.includes('obrigatório')) {
      return 400;
    }
    
    if (error.message.includes('Saldo insuficiente')) {
      return 422;
    }
    
    if (error.message.includes('Conta de destino é obrigatória')) {
      return 400;
    }
    
    return 500;
  }
} 