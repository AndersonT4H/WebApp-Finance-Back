import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';
import { Account } from './src/entities/Account';
import { Transaction } from './src/entities/Transaction';

dotenv.config();

const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'sqlite',
  database: process.env.DB_DATABASE || path.join(__dirname, 'database.sqlite'),
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [Account, Transaction]
});

export default AppDataSource; 