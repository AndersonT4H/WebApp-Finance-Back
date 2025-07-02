import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Account } from './Account';
import { TransactionType } from '../types';

export const TransactionTypeEnum = {
  DEBIT: 'Débito' as TransactionType,
  CREDIT: 'Crédito' as TransactionType,
  TRANSFER: 'Transferência' as TransactionType
} as const;

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'datetime', nullable: false })
  transactionDate!: Date;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: false })
  updatedAt!: Date;

  @ManyToOne(() => Account, account => account.transactions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: Account;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationAccountId' })
  destinationAccount?: Account;

  constructor(type?: TransactionType, amount?: number, description: string = '', transactionDate: Date = new Date()) {
    if (type && amount !== undefined) {
      this.type = type;
      this.amount = amount;
      this.description = description ?? '';
      this.transactionDate = transactionDate ?? new Date();
    } else {
      this.description = '';
      this.transactionDate = new Date();
    }
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }


  static isValidType(type: string): type is TransactionType {
    return Object.values(TransactionTypeEnum).includes(type as TransactionType);
  }


  static isValidAmount(amount: number): boolean {
    return amount > 0 && typeof amount === 'number';
  }

  updateType(type: TransactionType): void {
    if (!Transaction.isValidType(type)) {
      throw new Error('Tipo de transação inválido');
    }
    this.type = type;
    this.updatedAt = new Date();
  }


  updateAmount(amount: number): void {
    if (!Transaction.isValidAmount(amount)) {
      throw new Error('Valor deve ser maior que zero');
    }
    this.amount = amount;
    this.updatedAt = new Date();
  }


  updateDescription(description: string): void {
    this.description = description || '';
    this.updatedAt = new Date();
  }

  updateTransactionDate(transactionDate: Date): void {
    if (!(transactionDate instanceof Date)) {
      throw new Error('Data da transação deve ser uma data válida');
    }
    this.transactionDate = transactionDate;
    this.updatedAt = new Date();
  }


  getFormattedAmount(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.amount);
  }

  getFormattedDate(): string {
    return this.transactionDate.toLocaleDateString('pt-BR');
  }


  isTransfer(): boolean {
    return this.type === TransactionTypeEnum.TRANSFER;
  }


  isDebit(): boolean {
    return this.type === TransactionTypeEnum.DEBIT;
  }


  isCredit(): boolean {
    return this.type === TransactionTypeEnum.CREDIT;
  }
} 