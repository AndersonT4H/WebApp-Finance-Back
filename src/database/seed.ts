import 'reflect-metadata';
import AppDataSource from '../config/database';
import { Account } from '../entities/Account';
import { Transaction, TransactionTypeEnum } from '../entities/Transaction';
import { AccountService } from '../services/AccountService';
import { TransactionService } from '../services/TransactionService';


async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Inicializa a conexão com o banco
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco estabelecida');

    // Obtém os repositórios
    const accountRepository = AppDataSource.getRepository(Account);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Inicializa os serviços
    const accountService = new AccountService(accountRepository);
    const transactionService = new TransactionService(transactionRepository, accountService);

    // Limpa dados existentes
    await transactionRepository.clear();
    await accountRepository.clear();
    console.log('🧹 Dados existentes removidos');

    // Cria contas de exemplo
    const accounts = await createSampleAccounts(accountService);
    if (accounts.some(acc => !acc.id)) throw new Error('Falha ao criar contas de exemplo: id indefinido');
    console.log(`✅ ${accounts.length} contas criadas`);

    // Cria transações de exemplo
    const transactions = await createSampleTransactions(transactionService, accounts);
    console.log(`✅ ${transactions.length} transações criadas`);

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Contas: ${accounts.length}`);
    console.log(`   - Transações: ${transactions.length}`);

    // Exibe estatísticas
    const totalBalance = await accountService.getTotalBalance();
    console.log(`   - Saldo total: R$ ${totalBalance.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

async function createSampleAccounts(accountService: AccountService): Promise<Account[]> {
  const accountsData = [
    {
      name: 'Conta Corrente Principal',
      type: 'Corrente' as const,
      initialBalance: 5000.00
    },
    {
      name: 'Conta Poupança',
      type: 'Poupança' as const,
      initialBalance: 15000.00
    },
    {
      name: 'Cartão de Crédito',
      type: 'Crédito' as const,
      initialBalance: 0.00
    },
    {
      name: 'Conta Investimento',
      type: 'Investimento' as const,
      initialBalance: 25000.00
    },
    {
      name: 'Conta Corrente Secundária',
      type: 'Corrente' as const,
      initialBalance: 2000.00
    }
  ];

  const accounts: Account[] = [];
  
  for (const accountData of accountsData) {
    const account = await accountService.createAccount(accountData);
    accounts.push(account as Account);
  }

  return accounts;
}

async function createSampleTransactions(
  transactionService: TransactionService, 
  accounts: Account[]
): Promise<Transaction[]> {
  const transactions: Transaction[] = [];

  // Transações de crédito (receitas)
  const creditTransactions = [
    {
      type: TransactionTypeEnum.CREDIT,
      amount: 3500.00,
      description: 'Salário',
      accountId: accounts[0]?.id!,
      transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 dias atrás
    },
    {
      type: TransactionTypeEnum.CREDIT,
      amount: 800.00,
      description: 'Freelance',
      accountId: accounts[0]?.id!,
      transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 dias atrás
    },
    {
      type: TransactionTypeEnum.CREDIT,
      amount: 500.00,
      description: 'Rendimento poupança',
      accountId: accounts[1]?.id!,
      transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
    }
  ];

  // Transações de débito (despesas)
  const debitTransactions = [
    {
      type: TransactionTypeEnum.DEBIT,
      amount: 1200.00,
      description: 'Aluguel',
      accountId: accounts[0]?.id!,
      transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
    },
    {
      type: TransactionTypeEnum.DEBIT,
      amount: 450.00,
      description: 'Supermercado',
      accountId: accounts[0]?.id!,
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
    },
    {
      type: TransactionTypeEnum.DEBIT,
      amount: 200.00,
      description: 'Combustível',
      accountId: accounts[0]?.id!,
      transactionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 dias atrás
    },
    {
      type: TransactionTypeEnum.DEBIT,
      amount: 150.00,
      description: 'Academia',
      accountId: accounts[4]?.id!,
      transactionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 dias atrás
    }
  ];

  // Transferências entre contas
  const transferTransactions = [
    {
      type: TransactionTypeEnum.TRANSFER,
      amount: 1000.00,
      description: 'Transferência para poupança',
      accountId: accounts[0]?.id!,
      destinationAccountId: accounts[1]?.id!,
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
    },
    {
      type: TransactionTypeEnum.TRANSFER,
      amount: 5000.00,
      description: 'Investimento',
      accountId: accounts[1]?.id!,
      destinationAccountId: accounts[3]?.id!,
      transactionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 dias atrás
    }
  ];

  // Cria todas as transações
  for (const transactionData of [...creditTransactions, ...debitTransactions, ...transferTransactions]) {
    if (!transactionData.accountId || ('destinationAccountId' in transactionData && !transactionData['destinationAccountId'])) {
      throw new Error('ID de conta ou conta de destino indefinido ao criar transação de exemplo');
    }
    const transaction = await transactionService.createTransaction(transactionData);
    transactions.push(transaction as Transaction);
  }

  return transactions;
}

// Executa o seed se este arquivo for executado diretamente
if (require.main === module) {
  seedDatabase();
} 