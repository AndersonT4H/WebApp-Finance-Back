import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'reflect-metadata';

import AppDataSource from './config/database';
import { createAccountRoutes } from './routes/accountRoutes';
import { createTransactionRoutes } from './routes/transactionRoutes';
import { errorHandler } from './middleware/errorHandler';
import { AccountService } from './services/AccountService';
import { TransactionService } from './services/TransactionService';
import { IServer } from './types';
import { Account } from './entities/Account';
import { Transaction } from './entities/Transaction';

dotenv.config();


export class Server implements IServer {
  public app: Application;
  public port: number;
  public dataSource: typeof AppDataSource;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000');
    this.dataSource = AppDataSource;
  }

  /**
   * Configura os middlewares da aplicação
   */
  configureMiddlewares(): void {
    // Middleware de segurança
    this.app.use(helmet());

    // Middleware de CORS
    this.app.use(cors({
      origin: process.env['CORS_ORIGIN'] || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 100, // limite de 100 requisições por IP
      message: {
        success: false,
        message: 'Muitas requisições. Tente novamente mais tarde.'
      }
    });
    this.app.use(limiter);

    // Middleware de logging
    this.app.use(morgan('combined'));

    // Middleware para parsing de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware para tratamento de erros de JSON
    this.app.use(errorHandler.jsonErrorHandler);
  }

  /**
   * Configura as rotas da aplicação
   */
  configureRoutes(): void {
    // Rota de health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Servidor funcionando corretamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Rota raiz
    this.app.get('/', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'API do Gestor Financeiro Pessoal',
        version: '1.0.0',
        endpoints: {
          accounts: '/api/accounts',
          transactions: '/api/transactions',
          health: '/health'
        }
      });
    });

    // Inicializa os serviços
    const accountRepository = this.dataSource.getRepository(Account);
    const transactionRepository = this.dataSource.getRepository(Transaction);
    
    const accountService = new AccountService(accountRepository);
    const transactionService = new TransactionService(transactionRepository, accountService);

    // Configura as rotas da API
    this.app.use('/api/accounts', createAccountRoutes(accountService));
    this.app.use('/api/transactions', createTransactionRoutes(transactionService));

    // Middleware para rotas não encontradas
    this.app.use('*', errorHandler.notFoundHandler);
  }

  /**
   * Inicializa o servidor
   */
  async start(): Promise<void> {
    try {
      // Inicializa a conexão com o banco de dados
      await this.dataSource.initialize();
      console.log('✅ Conexão com o banco de dados estabelecida');

      // Configura middlewares e rotas
      this.configureMiddlewares();
      this.configureRoutes();

      // Configura tratamento de erros global
      this.app.use(errorHandler.errorHandler);

      // Inicia o servidor
      this.app.listen(this.port, () => {
        console.log(`🚀 Servidor rodando na porta ${this.port}`);
        console.log(`📊 Ambiente: ${process.env['NODE_ENV'] || 'development'}`);
        console.log(`🔗 URL: http://localhost:${this.port}`);
      });

      // Configura graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Erro ao inicializar o servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Para o servidor de forma graciosa
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Parando o servidor...');
      
      // Fecha a conexão com o banco de dados
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Conexão com o banco de dados fechada');
      }

      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao parar o servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Configura o graceful shutdown
   * @private
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📡 Recebido sinal ${signal}. Iniciando graceful shutdown...`);
      await this.stop();
    };

    // Captura sinais de interrupção
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Captura erros não tratados
    process.on('uncaughtException', (error) => {
      console.error('❌ Erro não tratado:', error);
      this.stop();
    });

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Promise rejeitada não tratada:', reason);
      this.stop();
    });
  }
}

// Inicializa o servidor se este arquivo for executado diretamente
if (require.main === module) {
  const server = new Server();
  server.start();
} 