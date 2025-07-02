import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { IAccountService } from '../types';

export function createAccountRoutes(accountService: IAccountService): Router {
  const router = Router();
  const accountController = new AccountController(accountService);

  // POST /api/accounts - Criar nova conta
  router.post('/', (req, res) => accountController.createAccount(req, res));

  // GET /api/accounts - Listar todas as contas
  router.get('/', (req, res) => accountController.getAllAccounts(req, res));

  // GET /api/accounts/statistics - Obter estatísticas das contas
  router.get('/statistics', (req, res) => accountController.getAccountStatistics(req, res));

  // GET /api/accounts/balance - Obter saldo total
  router.get('/balance', (req, res) => accountController.getTotalBalance(req, res));

  // GET /api/accounts/type/:type - Buscar contas por tipo
  router.get('/type/:type', (req, res) => accountController.getAccountsByType(req, res));

  // GET /api/accounts/:id - Buscar conta por ID
  router.get('/:id', (req, res) => accountController.getAccountById(req, res));

  // PUT /api/accounts/:id - Atualizar conta
  router.put('/:id', (req, res) => accountController.updateAccount(req, res));

  // DELETE /api/accounts/:id - Remover conta
  router.delete('/:id', (req, res) => accountController.deleteAccount(req, res));

  return router;
} 