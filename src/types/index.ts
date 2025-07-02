// Tipos para contas
export interface IAccount {
  id?: number;
  name: string;
  type: AccountType;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AccountType = 'Corrente' | 'Poupança' | 'Crédito' | 'Investimento';

export interface ICreateAccountData {
  name: string;
  type: AccountType;
  initialBalance?: number;
}

export interface IUpdateAccountData {
  name?: string;
  type?: AccountType;
}

export interface IAccountStatistics {
  totalAccounts: number;
  totalBalance: number;
  accountsByType: Array<{
    type: AccountType;
    count: number;
    totalBalance: number;
  }>;
}

// Tipos para transações
export interface ITransaction {
  id?: number;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate: Date;
  account?: IAccount;
  destinationAccount?: IAccount;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TransactionType = 'Débito' | 'Crédito' | 'Transferência';

export interface ICreateTransactionData {
  type: TransactionType;
  amount: number;
  description?: string;
  accountId: number;
  destinationAccountId?: number;
  transactionDate?: string | Date;
}

export interface IUpdateTransactionData {
  type?: TransactionType;
  amount?: number;
  description?: string;
  transactionDate?: string | Date;
}

export interface ITransferData {
  amount: number;
  description?: string;
  accountId: number;
  destinationAccountId: number;
}

export interface ITransactionFilters {
  accountId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface ITransactionStatistics {
  totalTransactions: number;
  totalAmount: number;
  byType: Record<TransactionType, {
    count: number;
    totalAmount: number;
  }>;
}

// Tipos para respostas da API
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | undefined;
  timestamp?: string;
}

// Tipos para repositórios
export interface IRepository<T> {
  save(entity: T): Promise<T>;
  find(options?: any): Promise<T[]>;
  findOne(options: any): Promise<T | null>;
  remove(entity: T): Promise<T>;
  count(options?: any): Promise<number>;
  createQueryBuilder(alias: string): any;
}

// Tipos para serviços
export interface IAccountService {
  createAccount(data: ICreateAccountData): Promise<IAccount>;
  getAllAccounts(): Promise<IAccount[]>;
  getAccountById(id: number): Promise<IAccount>;
  updateAccount(id: number, data: IUpdateAccountData): Promise<IAccount>;
  deleteAccount(id: number): Promise<boolean>;
  updateAccountBalance(accountId: number, amount: number, operation: 'credit' | 'debit'): Promise<IAccount>;
  getAccountsByType(type: AccountType): Promise<IAccount[]>;
  getTotalBalance(): Promise<number>;
  accountExists(id: number): Promise<boolean>;
  getAccountStatistics(): Promise<IAccountStatistics>;
}

export interface ITransactionService {
  createTransaction(data: ICreateTransactionData): Promise<ITransaction>;
  getAllTransactions(filters?: ITransactionFilters): Promise<ITransaction[]>;
  getTransactionById(id: number): Promise<ITransaction>;
  updateTransaction(id: number, data: IUpdateTransactionData): Promise<ITransaction>;
  deleteTransaction(id: number): Promise<boolean>;
  createTransfer(data: ITransferData): Promise<ITransaction>;
  getTransactionsByAccount(accountId: number): Promise<ITransaction[]>;
  getTransactionStatistics(filters?: ITransactionFilters): Promise<ITransactionStatistics>;
  transactionExists(id: number): Promise<boolean>;
}

// Tipos para controladores
export interface IAccountController {
  createAccount(req: any, res: any): Promise<void>;
  getAllAccounts(req: any, res: any): Promise<void>;
  getAccountById(req: any, res: any): Promise<void>;
  updateAccount(req: any, res: any): Promise<void>;
  deleteAccount(req: any, res: any): Promise<void>;
  getAccountsByType(req: any, res: any): Promise<void>;
  getAccountStatistics(req: any, res: any): Promise<void>;
  getTotalBalance(req: any, res: any): Promise<void>;
}

export interface ITransactionController {
  createTransaction(req: any, res: any): Promise<void>;
  getAllTransactions(req: any, res: any): Promise<void>;
  getTransactionById(req: any, res: any): Promise<void>;
  updateTransaction(req: any, res: any): Promise<void>;
  deleteTransaction(req: any, res: any): Promise<void>;
  createTransfer(req: any, res: any): Promise<void>;
  getTransactionsByAccount(req: any, res: any): Promise<void>;
  getTransactionStatistics(req: any, res: any): Promise<void>;
}

// Tipos para middlewares
export interface IErrorHandler {
  errorHandler(error: Error, req: any, res: any, next: any): void;
  notFoundHandler(req: any, res: any, next: any): void;
  jsonErrorHandler(error: Error, req: any, res: any, next: any): void;
}

// Tipos para configuração
export interface IDatabaseConfig {
  type: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
  cli: {
    entitiesDir: string;
    migrationsDir: string;
    subscribersDir: string;
  };
}

// Tipos para o servidor
export interface IServer {
  app: any;
  port: number;
  dataSource: any;
  configureMiddlewares(): void;
  configureRoutes(): void;
  start(): Promise<void>;
  stop(): Promise<void>;
} 