import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { ITransactionService } from '../types';


export function createTransactionRoutes(transactionService: ITransactionService): Router {
  const router = Router();
  const transactionController = new TransactionController(transactionService);

  // POST /api/transactions - Criar nova transação
  router.post('/', (req, res) => transactionController.createTransaction(req, res));

  // POST /api/transactions/transfer - Realizar transferência
  router.post('/transfer', (req, res) => transactionController.createTransfer(req, res));

  // GET /api/transactions - Listar todas as transações
  router.get('/', (req, res) => transactionController.getAllTransactions(req, res));

  // GET /api/transactions/statistics - Obter estatísticas das transações
  router.get('/statistics', (req, res) => transactionController.getTransactionStatistics(req, res));

  // GET /api/transactions/account/:accountId - Buscar transações por conta
  router.get('/account/:accountId', (req, res) => transactionController.getTransactionsByAccount(req, res));

  // GET /api/transactions/:id - Buscar transação por ID
  router.get('/:id', (req, res) => transactionController.getTransactionById(req, res));

  // PUT /api/transactions/:id - Atualizar transação
  router.put('/:id', (req, res) => transactionController.updateTransaction(req, res));

  // DELETE /api/transactions/:id - Remover transação
  router.delete('/:id', (req, res) => transactionController.deleteTransaction(req, res));

  return router;
} 