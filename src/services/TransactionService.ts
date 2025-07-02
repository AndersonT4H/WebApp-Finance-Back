import { Repository } from 'typeorm';
import { Transaction, TransactionTypeEnum } from '../entities/Transaction';
import { Account } from '../entities/Account';
import { 
  ITransactionService, 
  ICreateTransactionData, 
  IUpdateTransactionData, 
  ITransferData, 
  ITransactionFilters, 
  ITransactionStatistics,
  ITransaction,
  TransactionType 
} from '../types';
import { IAccountService } from '../types';

export class TransactionService implements ITransactionService {
  constructor(
    private transactionRepository: Repository<Transaction>,
    private accountService: IAccountService
  ) {}

  async createTransaction(transactionData: ICreateTransactionData): Promise<ITransaction> {
    this.validateTransactionData(transactionData);
    
    const transaction = new Transaction(
      transactionData.type,
      transactionData.amount,
      transactionData.description,
      new Date(transactionData.transactionDate || Date.now())
    );

    // Busca a conta de origem
    const account = await this.accountService.getAccountById(transactionData.accountId);
    transaction.account = account as Account;

    // Para transferências, busca a conta de destino
    if (transaction.isTransfer()) {
      if (!transactionData.destinationAccountId) {
        throw new Error('Conta de destino é obrigatória para transferências');
      }
      
      const destinationAccount = await this.accountService.getAccountById(transactionData.destinationAccountId);
      transaction.destinationAccount = destinationAccount as Account;
    }

    // Executa a transação
    await this.executeTransaction(transaction);

    const savedTransaction = await this.transactionRepository.save(transaction);
    return savedTransaction;
  }

  private async executeTransaction(transaction: Transaction): Promise<void> {
    if (transaction.isDebit()) {
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'debit'
      );
    } else if (transaction.isCredit()) {
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'credit'
      );
    } else if (transaction.isTransfer()) {
      // Para transferências, debita da conta de origem e credita na de destino
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'debit'
      );
      
      await this.accountService.updateAccountBalance(
        transaction.destinationAccount!.id!,
        transaction.amount,
        'credit'
      );
    }
  }

  async getAllTransactions(filters: ITransactionFilters = {}): Promise<ITransaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
      .orderBy('transaction.transactionDate', 'DESC');

    // Aplica filtros
    if (filters.accountId) {
      queryBuilder.andWhere('transaction.account.id = :accountId', { accountId: filters.accountId });
    }

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { 
        startDate: new Date(filters.startDate) 
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { 
        endDate: new Date(filters.endDate) 
      });
    }

    return await queryBuilder.getMany();
  }

  async getTransactionById(id: number): Promise<ITransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['account', 'destinationAccount']
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    return transaction;
  }

  async updateTransaction(id: number, updateData: IUpdateTransactionData): Promise<ITransaction> {
    const transaction = await this.getTransactionById(id) as Transaction;

    // Reverte a transação original
    await this.reverseTransaction(transaction);

    // Atualiza os dados da transação
    if (updateData.type) {
      transaction.updateType(updateData.type);
    }

    if (updateData.amount) {
      transaction.updateAmount(updateData.amount);
    }

    if (updateData.description !== undefined) {
      transaction.updateDescription(updateData.description);
    }

    if (updateData.transactionDate) {
      transaction.updateTransactionDate(new Date(updateData.transactionDate));
    }

    // Executa a transação atualizada
    await this.executeTransaction(transaction);

    return await this.transactionRepository.save(transaction);
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = await this.getTransactionById(id) as Transaction;

    // Reverte a transação
    await this.reverseTransaction(transaction);

    await this.transactionRepository.remove(transaction);
    return true;
  }

  private async reverseTransaction(transaction: Transaction): Promise<void> {
    if (transaction.isDebit()) {
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'credit'
      );
    } else if (transaction.isCredit()) {
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'debit'
      );
    } else if (transaction.isTransfer()) {
      // Para transferências, credita de volta na conta de origem e debita da de destino
      await this.accountService.updateAccountBalance(
        transaction.account.id!,
        transaction.amount,
        'credit'
      );
      
      await this.accountService.updateAccountBalance(
        transaction.destinationAccount!.id!,
        transaction.amount,
        'debit'
      );
    }
  }

  async createTransfer(transferData: ITransferData): Promise<ITransaction> {
    const transferTransactionData: ICreateTransactionData = {
      ...transferData,
      type: TransactionTypeEnum.TRANSFER
    };

    return await this.createTransaction(transferTransactionData);
  }

  async getTransactionsByAccount(accountId: number): Promise<ITransaction[]> {
    return await this.transactionRepository.find({
      where: [
        { account: { id: accountId } },
        { destinationAccount: { id: accountId } }
      ],
      relations: ['account', 'destinationAccount'],
      order: { transactionDate: 'DESC' }
    });
  }

  async getTransactionStatistics(filters: ITransactionFilters = {}): Promise<ITransactionStatistics> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount');

    // Aplica filtros
    if (filters.accountId) {
      queryBuilder.andWhere('transaction.account.id = :accountId', { accountId: filters.accountId });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { 
        startDate: new Date(filters.startDate) 
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { 
        endDate: new Date(filters.endDate) 
      });
    }

    const results = await queryBuilder
      .groupBy('transaction.type')
      .getRawMany();

    const statistics: ITransactionStatistics = {
      totalTransactions: 0,
      totalAmount: 0,
      byType: {} as Record<TransactionType, { count: number; totalAmount: number }>
    };

    results.forEach((result: any) => {
      const count = parseInt(result.count);
      const amount = parseFloat(result.totalAmount) || 0;
      
      statistics.totalTransactions += count;
      statistics.totalAmount += amount;
      statistics.byType[result.type as TransactionType] = {
        count,
        totalAmount: amount
      };
    });

    return statistics;
  }

  private validateTransactionData(transactionData: ICreateTransactionData): void {
    if (!transactionData.type || !Transaction.isValidType(transactionData.type)) {
      throw new Error('Tipo de transação inválido');
    }

    if (!transactionData.amount || !Transaction.isValidAmount(transactionData.amount)) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!transactionData.accountId) {
      throw new Error('Conta de origem é obrigatória');
    }

    if (transactionData.transactionDate) {
      const date = new Date(transactionData.transactionDate);
      if (isNaN(date.getTime())) {
        throw new Error('Data da transação inválida');
      }
    }
  }

  async transactionExists(id: number): Promise<boolean> {
    const count = await this.transactionRepository.count({ where: { id } });
    return count > 0;
  }
} 