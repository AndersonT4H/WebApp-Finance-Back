import { Transaction, TransactionTypeEnum } from '../../src/entities/Transaction';
import { TransactionType } from '../../src/types';

/**
 * Testes unitários para a entidade Transaction
 * Aplicando princípios de Clean Code:
 * - Testes isolados: Cada teste testa uma funcionalidade específica
 * - Nomes descritivos: Testes com nomes claros
 * - Cobertura completa: Testa casos de sucesso e erro
 */
describe('Transaction Entity', () => {
  let transaction: Transaction;

  beforeEach(() => {
    transaction = new Transaction('Débito', 100.00, 'Teste de transação', new Date());
  });

  describe('Constructor', () => {
    it('should create a transaction with valid data', () => {
      expect(transaction.type).toBe('Débito');
      expect(transaction.amount).toBe(100.00);
      expect(transaction.description).toBe('Teste de transação');
      expect(transaction.transactionDate).toBeInstanceOf(Date);
    });

    it('should create a transaction with default description', () => {
      const newTransaction = new Transaction('Crédito', 200.00);
      expect(newTransaction.description).toBe('');
    });

    it('should create a transaction with current date when not provided', () => {
      const beforeCreation = new Date();
      const newTransaction = new Transaction('Transferência', 300.00);
      const afterCreation = new Date();

      expect(newTransaction.transactionDate.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(newTransaction.transactionDate.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should create an empty transaction when no parameters provided', () => {
      const emptyTransaction = new Transaction();
      expect(emptyTransaction.type).toBeUndefined();
      expect(emptyTransaction.amount).toBeUndefined();
      expect(emptyTransaction.description).toBe('');
      expect(emptyTransaction.transactionDate).toBeInstanceOf(Date);
    });
  });

  describe('Static validation methods', () => {
    describe('isValidType', () => {
      it('should return true for valid transaction types', () => {
        expect(Transaction.isValidType('Débito')).toBe(true);
        expect(Transaction.isValidType('Crédito')).toBe(true);
        expect(Transaction.isValidType('Transferência')).toBe(true);
      });

      it('should return false for invalid transaction types', () => {
        expect(Transaction.isValidType('Tipo Inválido')).toBe(false);
        expect(Transaction.isValidType('')).toBe(false);
        expect(Transaction.isValidType('debito')).toBe(false); // lowercase
      });
    });

    describe('isValidAmount', () => {
      it('should return true for valid amounts', () => {
        expect(Transaction.isValidAmount(100)).toBe(true);
        expect(Transaction.isValidAmount(0.01)).toBe(true);
        expect(Transaction.isValidAmount(999999.99)).toBe(true);
      });

      it('should return false for invalid amounts', () => {
        expect(Transaction.isValidAmount(0)).toBe(false);
        expect(Transaction.isValidAmount(-100)).toBe(false);
        expect(Transaction.isValidAmount(NaN)).toBe(false);
      });
    });
  });

  describe('updateType method', () => {
    it('should update transaction type with valid type', () => {
      transaction.updateType('Crédito');
      expect(transaction.type).toBe('Crédito');
    });

    it('should throw error for invalid transaction type', () => {
      expect(() => transaction.updateType('Tipo Inválido' as TransactionType)).toThrow('Tipo de transação inválido');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = transaction.updatedAt;
      
      setTimeout(() => {
        transaction.updateType('Crédito');
        expect(transaction.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('updateAmount method', () => {
    it('should update transaction amount with valid amount', () => {
      transaction.updateAmount(200.00);
      expect(transaction.amount).toBe(200.00);
    });

    it('should throw error for zero amount', () => {
      expect(() => transaction.updateAmount(0)).toThrow('Valor deve ser maior que zero');
    });

    it('should throw error for negative amount', () => {
      expect(() => transaction.updateAmount(-100)).toThrow('Valor deve ser maior que zero');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = transaction.updatedAt;
      
      setTimeout(() => {
        transaction.updateAmount(150);
        expect(transaction.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('updateDescription method', () => {
    it('should update transaction description', () => {
      transaction.updateDescription('Nova descrição');
      expect(transaction.description).toBe('Nova descrição');
    });

    it('should set empty string for null/undefined description', () => {
      transaction.updateDescription('');
      expect(transaction.description).toBe('');

      transaction.updateDescription(undefined as any);
      expect(transaction.description).toBe('');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = transaction.updatedAt;
      
      setTimeout(() => {
        transaction.updateDescription('Nova descrição');
        expect(transaction.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('updateTransactionDate method', () => {
    it('should update transaction date with valid date', () => {
      const newDate = new Date('2024-01-15');
      transaction.updateTransactionDate(newDate);
      expect(transaction.transactionDate).toEqual(newDate);
    });

    it('should throw error for invalid date', () => {
      expect(() => transaction.updateTransactionDate('data inválida' as any)).toThrow('Data da transação deve ser uma data válida');
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = transaction.updatedAt;
      
      setTimeout(() => {
        transaction.updateTransactionDate(new Date());
        expect(transaction.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      }, 1);
    });
  });

  describe('getFormattedAmount method', () => {
    it('should format amount in Brazilian currency', () => {
      transaction.amount = 1234.56;
      const formatted = transaction.getFormattedAmount();
      expect(formatted).toMatch(/R\$\s*1\.234,56/);
    });

    it('should handle zero amount', () => {
      transaction.amount = 0;
      const formatted = transaction.getFormattedAmount();
      expect(formatted).toMatch(/R\$\s*0,00/);
    });

    it('should handle decimal amounts', () => {
      transaction.amount = 0.01;
      const formatted = transaction.getFormattedAmount();
      expect(formatted).toMatch(/R\$\s*0,01/);
    });
  });

  describe('getFormattedDate method', () => {
    it('should format date in Brazilian format', () => {
      transaction.transactionDate = new Date(2024, 0, 15); // 15 de janeiro de 2024
      const formatted = transaction.getFormattedDate();
      expect(formatted).toBe('15/01/2024');
    });

    it('should handle different dates', () => {
      transaction.transactionDate = new Date(2024, 11, 31); // 31 de dezembro de 2024
      const formatted = transaction.getFormattedDate();
      expect(formatted).toBe('31/12/2024');
    });
  });

  describe('Type checking methods', () => {
    it('should correctly identify transfer transactions', () => {
      transaction.type = TransactionTypeEnum.TRANSFER;
      expect(transaction.isTransfer()).toBe(true);
      expect(transaction.isDebit()).toBe(false);
      expect(transaction.isCredit()).toBe(false);
    });

    it('should correctly identify debit transactions', () => {
      transaction.type = TransactionTypeEnum.DEBIT;
      expect(transaction.isDebit()).toBe(true);
      expect(transaction.isCredit()).toBe(false);
      expect(transaction.isTransfer()).toBe(false);
    });

    it('should correctly identify credit transactions', () => {
      transaction.type = TransactionTypeEnum.CREDIT;
      expect(transaction.isCredit()).toBe(true);
      expect(transaction.isDebit()).toBe(false);
      expect(transaction.isTransfer()).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle decimal precision correctly', () => {
      transaction.updateAmount(0.01);
      expect(transaction.amount).toBe(0.01);

      transaction.updateAmount(999.99);
      expect(transaction.amount).toBe(999.99);
    });

    it('should handle large amounts', () => {
      transaction.updateAmount(999999.99);
      expect(transaction.amount).toBe(999999.99);
    });

    it('should maintain data integrity after multiple updates', () => {
      // Simula várias atualizações
      transaction.updateType('Crédito');
      transaction.updateAmount(500);
      transaction.updateDescription('Transação final');
      transaction.updateTransactionDate(new Date('2024-12-31'));

      expect(transaction.type).toBe('Crédito');
      expect(transaction.amount).toBe(500);
      expect(transaction.description).toBe('Transação final');
      expect(transaction.transactionDate).toEqual(new Date('2024-12-31'));
    });

    it('should handle special characters in description', () => {
      const specialDescription = 'Transação com caracteres especiais: @#$%&*()_+-=[]{}|;:,.<>?';
      transaction.updateDescription(specialDescription);
      expect(transaction.description).toBe(specialDescription);
    });

    it('should handle unicode characters in description', () => {
      const unicodeDescription = 'Transação com acentos: áéíóú çãõ ñ';
      transaction.updateDescription(unicodeDescription);
      expect(transaction.description).toBe(unicodeDescription);
    });
  });
}); 