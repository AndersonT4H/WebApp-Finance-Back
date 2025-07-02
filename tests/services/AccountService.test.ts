import { Repository } from 'typeorm';
import { AccountService } from '../../src/services/AccountService';
import { Account } from '../../src/entities/Account';
import { ICreateAccountData, IUpdateAccountData, AccountType } from '../../src/types';

/**
 * Testes unitários para o AccountService
 * Aplicando princípios de Clean Code:
 * - Testes isolados: Cada teste testa uma funcionalidade específica
 * - Nomes descritivos: Testes com nomes claros
 * - Mocks adequados: Simula dependências externas
 */
describe('AccountService', () => {
  let accountService: AccountService;
  let mockRepository: jest.Mocked<Repository<Account>>;

  beforeEach(() => {
    // Cria um mock do repositório
    mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    accountService = new AccountService(mockRepository);
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const accountData: ICreateAccountData = {
        name: 'Conta Teste',
        type: 'Corrente',
        initialBalance: 1000.00
      };

      const mockAccount = new Account(accountData.name, accountData.type, accountData.initialBalance);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await accountService.createAccount(accountData);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Account));
      expect(result).toEqual(mockAccount);
    });

    it('should create account with default balance when not provided', async () => {
      const accountData: ICreateAccountData = {
        name: 'Conta Teste',
        type: 'Poupança'
      };

      const mockAccount = new Account(accountData.name, accountData.type, 0);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await accountService.createAccount(accountData);

      expect(result.balance).toBe(0);
    });

    it('should throw error for empty name', async () => {
      const accountData: ICreateAccountData = {
        name: '',
        type: 'Corrente'
      };

      await expect(accountService.createAccount(accountData)).rejects.toThrow('Nome da conta é obrigatório');
    });

    it('should throw error for invalid account type', async () => {
      const accountData: ICreateAccountData = {
        name: 'Conta Teste',
        type: 'Tipo Inválido' as AccountType
      };

      await expect(accountService.createAccount(accountData)).rejects.toThrow('Tipo de conta inválido');
    });

    it('should throw error for negative initial balance', async () => {
      const accountData: ICreateAccountData = {
        name: 'Conta Teste',
        type: 'Corrente',
        initialBalance: -100
      };

      await expect(accountService.createAccount(accountData)).rejects.toThrow('Saldo inicial não pode ser negativo');
    });
  });

  describe('getAllAccounts', () => {
    it('should return all accounts ordered by name', async () => {
      const mockAccounts = [
        new Account('Conta A', 'Corrente', 1000),
        new Account('Conta B', 'Poupança', 2000)
      ];

      mockRepository.find.mockResolvedValue(mockAccounts);

      const result = await accountService.getAllAccounts();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' }
      });
      expect(result).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await accountService.getAllAccounts();

      expect(result).toEqual([]);
    });
  });

  describe('getAccountById', () => {
    it('should return account when found', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await accountService.getAccountById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAccount);
    });

    it('should throw error when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(accountService.getAccountById(999)).rejects.toThrow('Conta não encontrada');
    });
  });

  describe('updateAccount', () => {
    it('should update account name successfully', async () => {
      const existingAccount = new Account('Conta Antiga', 'Corrente', 1000);
      const updateData: IUpdateAccountData = { name: 'Conta Nova' };

      mockRepository.findOne.mockResolvedValue(existingAccount);
      mockRepository.save.mockResolvedValue(existingAccount);

      const result = await accountService.updateAccount(1, updateData);

      expect(existingAccount.name).toBe('Conta Nova');
      expect(mockRepository.save).toHaveBeenCalledWith(existingAccount);
      expect(result).toEqual(existingAccount);
    });

    it('should update account type successfully', async () => {
      const existingAccount = new Account('Conta Teste', 'Corrente', 1000);
      const updateData: IUpdateAccountData = { type: 'Poupança' };

      mockRepository.findOne.mockResolvedValue(existingAccount);
      mockRepository.save.mockResolvedValue(existingAccount);

      const result = await accountService.updateAccount(1, updateData);

      expect(existingAccount.type).toBe('Poupança');
      expect(result).toEqual(existingAccount);
    });

    it('should update both name and type', async () => {
      const existingAccount = new Account('Conta Antiga', 'Corrente', 1000);
      const updateData: IUpdateAccountData = {
        name: 'Conta Nova',
        type: 'Investimento'
      };

      mockRepository.findOne.mockResolvedValue(existingAccount);
      mockRepository.save.mockResolvedValue(existingAccount);

      const result = await accountService.updateAccount(1, updateData);

      expect(existingAccount.name).toBe('Conta Nova');
      expect(existingAccount.type).toBe('Investimento');
      expect(result).toEqual(existingAccount);
    });

    it('should throw error when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(accountService.updateAccount(999, { name: 'Nova' })).rejects.toThrow('Conta não encontrada');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully when no transactions exist', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0)
      } as any);
      mockRepository.remove.mockResolvedValue(mockAccount);

      const result = await accountService.deleteAccount(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAccount);
      expect(result).toBe(true);
    });

    it('should throw error when account has transactions', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5)
      } as any);

      await expect(accountService.deleteAccount(1)).rejects.toThrow('Não é possível excluir uma conta que possui transações');
    });

    it('should throw error when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(accountService.deleteAccount(999)).rejects.toThrow('Conta não encontrada');
    });
  });

  describe('updateAccountBalance', () => {
    it('should credit amount successfully', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await accountService.updateAccountBalance(1, 500, 'credit');

      expect(mockAccount.balance).toBe(1500);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual(mockAccount);
    });

    it('should debit amount successfully', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await accountService.updateAccountBalance(1, 300, 'debit');

      expect(mockAccount.balance).toBe(700);
      expect(result).toEqual(mockAccount);
    });

    it('should throw error for invalid operation', async () => {
      const mockAccount = new Account('Conta Teste', 'Corrente', 1000);
      mockRepository.findOne.mockResolvedValue(mockAccount);

      await expect(accountService.updateAccountBalance(1, 100, 'invalid' as any)).rejects.toThrow('Operação inválida');
    });

    it('should throw error when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(accountService.updateAccountBalance(999, 100, 'credit')).rejects.toThrow('Conta não encontrada');
    });
  });

  describe('getAccountsByType', () => {
    it('should return accounts filtered by type', async () => {
      const mockAccounts = [
        new Account('Conta Corrente 1', 'Corrente', 1000),
        new Account('Conta Corrente 2', 'Corrente', 2000)
      ];

      mockRepository.find.mockResolvedValue(mockAccounts);

      const result = await accountService.getAccountsByType('Corrente');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { type: 'Corrente' },
        order: { name: 'ASC' }
      });
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('getTotalBalance', () => {
    it('should return total balance of all accounts', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '5000.00' })
      } as any);

      const result = await accountService.getTotalBalance();

      expect(result).toBe(5000.00);
    });

    it('should return 0 when no accounts exist', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null)
      } as any);

      const result = await accountService.getTotalBalance();

      expect(result).toBe(0);
    });
  });

  describe('accountExists', () => {
    it('should return true when account exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await accountService.accountExists(1);

      expect(mockRepository.count).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false when account does not exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await accountService.accountExists(999);

      expect(result).toBe(false);
    });
  });

  describe('getAccountStatistics', () => {
    it('should return account statistics', async () => {
      mockRepository.count.mockResolvedValue(5);
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'Corrente', count: '2', totalBalance: '3000.00' },
          { type: 'Poupança', count: '3', totalBalance: '15000.00' }
        ])
      } as any);

      // Mock getTotalBalance
      jest.spyOn(accountService, 'getTotalBalance').mockResolvedValue(18000.00);

      const result = await accountService.getAccountStatistics();

      expect(result.totalAccounts).toBe(5);
      expect(result.totalBalance).toBe(18000.00);
      expect(result.accountsByType).toHaveLength(2);
      expect(result.accountsByType[0]).toEqual({
        type: 'Corrente',
        count: 2,
        totalBalance: 3000.00
      });
    });
  });
}); 