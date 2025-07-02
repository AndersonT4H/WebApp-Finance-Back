import { Account } from '../../src/entities/Account';
import { AccountType } from '../../src/types';

/**
 * Testes unitários para a entidade Account
 * Aplicando princípios de Clean Code:
 * - Testes isolados: Cada teste testa uma funcionalidade específica
 * - Nomes descritivos: Testes com nomes claros
 * - Cobertura completa: Testa casos de sucesso e erro
 */
describe('Account Entity', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account('Conta Teste', 'Corrente', 1000.00);
  });

  describe('Constructor', () => {
    it('should create an account with valid data', () => {
      expect(account.name).toBe('Conta Teste');
      expect(account.type).toBe('Corrente');
      expect(account.balance).toBe(1000.00);
    });

    it('should create an account with default balance', () => {
      const newAccount = new Account('Conta Poupança', 'Poupança');
      expect(newAccount.balance).toBe(0);
    });

    it('should create an empty account when no parameters provided', () => {
      const emptyAccount = new Account();
      expect(emptyAccount.name).toBeUndefined();
      expect(emptyAccount.type).toBeUndefined();
      expect(emptyAccount.balance).toBe(0);
    });
  });

  describe('credit method', () => {
    it('should credit amount to account balance', () => {
      const initialBalance = account.balance;
      const creditAmount = 500.00;

      account.credit(creditAmount);

      expect(account.balance).toBe(initialBalance + creditAmount);
    });

    it('should throw error for zero amount', () => {
      expect(() => account.credit(0)).toThrow('Valor deve ser maior que zero');
    });

    it('should throw error for negative amount', () => {
      expect(() => account.credit(-100)).toThrow('Valor deve ser maior que zero');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = account.updatedAt;
      
      // Aguarda um milissegundo para garantir diferença de timestamp
      setTimeout(() => {
        account.credit(100);
        expect(account.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('debit method', () => {
    it('should debit amount from account balance', () => {
      const initialBalance = account.balance;
      const debitAmount = 300.00;

      account.debit(debitAmount);

      expect(account.balance).toBe(initialBalance - debitAmount);
    });

    it('should throw error for zero amount', () => {
      expect(() => account.debit(0)).toThrow('Valor deve ser maior que zero');
    });

    it('should throw error for negative amount', () => {
      expect(() => account.debit(-100)).toThrow('Valor deve ser maior que zero');
    });

    it('should throw error for insufficient balance', () => {
      expect(() => account.debit(2000.00)).toThrow('Saldo insuficiente');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = account.updatedAt;
      
      setTimeout(() => {
        account.debit(100);
        expect(account.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('hasSufficientBalance method', () => {
    it('should return true when balance is sufficient', () => {
      expect(account.hasSufficientBalance(500)).toBe(true);
      expect(account.hasSufficientBalance(1000)).toBe(true);
    });

    it('should return false when balance is insufficient', () => {
      expect(account.hasSufficientBalance(1500)).toBe(false);
    });

    it('should return true for zero amount', () => {
      expect(account.hasSufficientBalance(0)).toBe(true);
    });
  });

  describe('getBalance method', () => {
    it('should return current balance', () => {
      expect(account.getBalance()).toBe(1000.00);
    });

    it('should return updated balance after operations', () => {
      account.credit(500);
      expect(account.getBalance()).toBe(1500.00);

      account.debit(300);
      expect(account.getBalance()).toBe(1200.00);
    });
  });

  describe('updateName method', () => {
    it('should update account name', () => {
      account.updateName('Nova Conta');
      expect(account.name).toBe('Nova Conta');
    });

    it('should trim whitespace from name', () => {
      account.updateName('  Conta com Espaços  ');
      expect(account.name).toBe('Conta com Espaços');
    });

    it('should throw error for empty name', () => {
      expect(() => account.updateName('')).toThrow('Nome da conta é obrigatório');
    });

    it('should throw error for whitespace only name', () => {
      expect(() => account.updateName('   ')).toThrow('Nome da conta é obrigatório');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = account.updatedAt;
      
      setTimeout(() => {
        account.updateName('Novo Nome');
        expect(account.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('updateType method', () => {
    it('should update account type with valid type', () => {
      account.updateType('Poupança');
      expect(account.type).toBe('Poupança');
    });

    it('should accept all valid account types', () => {
      const validTypes: AccountType[] = ['Corrente', 'Poupança', 'Crédito', 'Investimento'];
      
      validTypes.forEach(type => {
        expect(() => account.updateType(type)).not.toThrow();
        expect(account.type).toBe(type);
      });
    });

    it('should throw error for invalid account type', () => {
      expect(() => account.updateType('Tipo Inválido' as AccountType)).toThrow('Tipo de conta inválido');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = account.updatedAt;
      
      setTimeout(() => {
        account.updateType('Poupança');
        expect(account.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('Edge cases', () => {
    it('should handle decimal precision correctly', () => {
      account.credit(0.01);
      expect(account.balance).toBe(1000.01);

      account.debit(0.01);
      expect(account.balance).toBe(1000.00);
    });

    it('should handle large amounts', () => {
      account.credit(999999.99);
      expect(account.balance).toBe(1000999.99);
    });

    it('should maintain data integrity after multiple operations', () => {
      // Simula várias operações
      account.credit(500);
      account.debit(200);
      account.credit(1000);
      account.debit(300);
      account.updateName('Conta Final');
      account.updateType('Investimento');

      expect(account.name).toBe('Conta Final');
      expect(account.type).toBe('Investimento');
      expect(account.balance).toBe(2000.00);
    });
  });
}); 