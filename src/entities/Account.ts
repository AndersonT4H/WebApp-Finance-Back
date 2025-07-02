import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Transaction } from './Transaction';
import { AccountType } from '../types';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  type!: AccountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: false })
  balance!: number;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: false })
  updatedAt!: Date;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions!: Transaction[];

  constructor(name?: string, type?: AccountType, initialBalance: number = 0) {
    if (name && type) {
      this.name = name;
      this.type = type;
      this.balance = initialBalance ?? 0;
    } else {
      this.balance = 0;
    }
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }


  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    this.balance += amount;
    this.updatedAt = new Date();
  }


  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    if (this.balance < amount) {
      throw new Error('Saldo insuficiente');
    }
    this.balance -= amount;
    this.updatedAt = new Date();
  }


  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }


  getBalance(): number {
    return this.balance;
  }


  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome da conta é obrigatório');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  updateType(type: AccountType): void {
    const validTypes: AccountType[] = ['Corrente', 'Poupança', 'Crédito', 'Investimento'];
    if (!validTypes.includes(type)) {
      throw new Error('Tipo de conta inválido');
    }
    this.type = type;
    this.updatedAt = new Date();
  }
} 