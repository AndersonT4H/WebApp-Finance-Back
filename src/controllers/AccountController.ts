import { Request, Response } from 'express';
import { IAccountController, IAccountService, IApiResponse } from '../types';

export class AccountController implements IAccountController {
  constructor(private accountService: IAccountService) {}

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountData = req.body;
      const account = await this.accountService.createAccount(accountData);
      
      const response: IApiResponse = {
        success: true,
        message: 'Conta criada com sucesso',
        data: account
      };
      
      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao criar conta');
    }
  }


  async getAllAccounts(_req: Request, res: Response): Promise<void> {
    try {
      const accounts = await this.accountService.getAllAccounts();
      
      const response: IApiResponse = {
        success: true,
        data: accounts
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar contas');
    }
  }

  async getAccountById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      const account = await this.accountService.getAccountById(parseInt(id));
      
      const response: IApiResponse = {
        success: true,
        data: account
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar conta');
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      const updateData = req.body;
      const account = await this.accountService.updateAccount(parseInt(id), updateData);
      
      const response: IApiResponse = {
        success: true,
        message: 'Conta atualizada com sucesso',
        data: account
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao atualizar conta');
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new Error('ID é obrigatório');
      await this.accountService.deleteAccount(parseInt(id));
      
      const response: IApiResponse = {
        success: true,
        message: 'Conta removida com sucesso'
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao remover conta');
    }
  }

  async getAccountsByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const accounts = await this.accountService.getAccountsByType(type as any);
      
      const response: IApiResponse = {
        success: true,
        data: accounts
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar contas por tipo');
    }
  }

  async getAccountStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.accountService.getAccountStatistics();
      
      const response: IApiResponse = {
        success: true,
        data: statistics
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar estatísticas das contas');
    }
  }

  async getTotalBalance(_req: Request, res: Response): Promise<void> {
    try {
      const totalBalance = await this.accountService.getTotalBalance();
      
      const response: IApiResponse = {
        success: true,
        data: {
          totalBalance
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error as Error, 'Erro ao buscar saldo total');
    }
  }

  private handleError(res: Response, error: Error, defaultMessage: string): void {
    console.error('AccountController Error:', error);
    
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
    
    if (error.message.includes('possui transações')) {
      return 409;
    }
    
    return 500;
  }
} 