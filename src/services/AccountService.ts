import { Repository } from 'typeorm';
import { Account } from '../entities/Account';
import { 
  IAccountService, 
  ICreateAccountData, 
  IUpdateAccountData, 
  //IAccount, 
  IAccountStatistics,
  AccountType 
} from '../types';

export class AccountService implements IAccountService {
  constructor(private accountRepository: Repository<Account>) {}

  async createAccount(accountData: ICreateAccountData): Promise<Account> {
    this.validateAccountData(accountData);
    
    const account = new Account(
      accountData.name,
      accountData.type,
      accountData.initialBalance || 0
    );

    const savedAccount = await this.accountRepository.save(account);
    return savedAccount as Account;
  }

  async getAllAccounts(): Promise<Account[]> {
    return await this.accountRepository.find({
      order: { name: 'ASC' }
    }) as Account[];
  }

  async getAccountById(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { id } });
    
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    return account as Account;
  }

  async updateAccount(id: number, updateData: IUpdateAccountData): Promise<Account> {
    const account = await this.getAccountById(id);
    
    if (updateData.name) {
      account.updateName(updateData.name);
    }
    
    if (updateData.type) {
      account.updateType(updateData.type);
    }

    return await this.accountRepository.save(account) as Account;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const account = await this.getAccountById(id);
    
    // Verifica se há transações associadas
    const transactionCount = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoin('account.transactions', 'transaction')
      .where('account.id = :id', { id })
      .getCount();

    if (transactionCount > 0) {
      throw new Error('Não é possível excluir uma conta que possui transações');
    }

    await this.accountRepository.remove(account);
    return true;
  }

  async updateAccountBalance(accountId: number, amount: number, operation: 'credit' | 'debit'): Promise<Account> {
    const account = await this.getAccountById(accountId);

    if (operation === 'credit') {
      account.credit(amount);
    } else if (operation === 'debit') {
      account.debit(amount);
    } else {
      throw new Error('Operação inválida');
    }

    return await this.accountRepository.save(account) as Account;
  }

  async getAccountsByType(type: AccountType): Promise<Account[]> {
    return await this.accountRepository.find({
      where: { type },
      order: { name: 'ASC' }
    }) as Account[];
  }

  async getTotalBalance(): Promise<number> {
    const result = await this.accountRepository
      .createQueryBuilder('account')
      .select('SUM(account.balance)', 'total')
      .getRawOne();

    return parseFloat(result?.total as string) || 0;
  }

  private validateAccountData(accountData: ICreateAccountData): void {
    if (!accountData.name || accountData.name.trim().length === 0) {
      throw new Error('Nome da conta é obrigatório');
    }

    if (!accountData.type) {
      throw new Error('Tipo da conta é obrigatório');
    }

    const validTypes: AccountType[] = ['Corrente', 'Poupança', 'Crédito', 'Investimento'];
    if (!validTypes.includes(accountData.type)) {
      throw new Error('Tipo de conta inválido');
    }

    if (accountData.initialBalance && typeof accountData.initialBalance !== 'number') {
      throw new Error('Saldo inicial deve ser um número');
    }

    if (accountData.initialBalance && accountData.initialBalance < 0) {
      throw new Error('Saldo inicial não pode ser negativo');
    }
  }

  async accountExists(id: number): Promise<boolean> {
    const count = await this.accountRepository.count({ where: { id } });
    return count > 0;
  }

  async getAccountStatistics(): Promise<IAccountStatistics> {
    const totalAccounts = await this.accountRepository.count();
    const totalBalance = await this.getTotalBalance();
    
    const accountsByType = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(account.balance)', 'totalBalance')
      .groupBy('account.type')
      .getRawMany();

    return {
      totalAccounts,
      totalBalance,
      accountsByType: accountsByType.map(item => ({
        type: item.type as AccountType,
        count: parseInt(item.count as string),
        totalBalance: parseFloat(item.totalBalance as string) || 0
      }))
    };
  }
} 