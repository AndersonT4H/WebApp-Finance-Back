# Documentação da API - Gestor Financeiro Pessoal

## 📋 Visão Geral

Esta documentação descreve todos os endpoints da API do Gestor Financeiro Pessoal, incluindo exemplos de requisições e respostas.

**Base URL**: `http://localhost:3001/api`

## 🔐 Autenticação

Atualmente, a API não requer autenticação. Em produção, recomenda-se implementar JWT ou outro método de autenticação.

## 📊 Endpoints

### Contas (`/accounts`)

#### 1. Criar Conta
**POST** `/accounts`

Cria uma nova conta bancária.

**Body:**
```json
{
  "name": "Conta Corrente Banco X",
  "type": "Corrente",
  "initialBalance": 1000
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "id": 1,
    "name": "Conta Corrente Banco X",
    "type": "Corrente",
    "balance": 1000,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

**Tipos de conta válidos:** `Corrente`, `Poupança`, `Crédito`, `Investimento`

#### 2. Listar Contas
**GET** `/accounts`

Retorna todas as contas cadastradas.

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente",
      "balance": 1000,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

#### 3. Buscar Conta por ID
**GET** `/accounts/:id`

Retorna uma conta específica.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Conta Corrente Banco X",
    "type": "Corrente",
    "balance": 1000,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### 4. Atualizar Conta
**PUT** `/accounts/:id`

Atualiza uma conta existente.

**Body:**
```json
{
  "name": "Conta Atualizada",
  "type": "Poupança"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Conta atualizada com sucesso",
  "data": {
    "id": 1,
    "name": "Conta Atualizada",
    "type": "Poupança",
    "balance": 1000,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  }
}
```

#### 5. Remover Conta
**DELETE** `/accounts/:id`

Remove uma conta (apenas se não possuir transações).

**Resposta (200):**
```json
{
  "success": true,
  "message": "Conta removida com sucesso"
}
```

#### 6. Estatísticas das Contas
**GET** `/accounts/statistics`

Retorna estatísticas gerais das contas.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalAccounts": 4,
    "totalBalance": 30000,
    "accountsByType": [
      {
        "type": "Corrente",
        "count": 2,
        "totalBalance": 15000
      },
      {
        "type": "Poupança",
        "count": 1,
        "totalBalance": 10000
      },
      {
        "type": "Investimento",
        "count": 1,
        "totalBalance": 5000
      }
    ]
  }
}
```

#### 7. Saldo Total
**GET** `/accounts/total-balance`

Retorna o saldo total de todas as contas.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalBalance": 30000
  }
}
```

#### 8. Contas por Tipo
**GET** `/accounts/type/:type`

Retorna contas filtradas por tipo.

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente",
      "balance": 10000,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Conta Corrente Banco Y",
      "type": "Corrente",
      "balance": 5000,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

### Transações (`/transactions`)

#### 1. Criar Transação
**POST** `/transactions`

Cria uma nova transação financeira.

**Body:**
```json
{
  "type": "Débito",
  "amount": 100,
  "description": "Pagamento de conta",
  "accountId": 1,
  "transactionDate": "2023-12-01T10:00:00.000Z"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Transação criada com sucesso",
  "data": {
    "id": 1,
    "type": "Débito",
    "amount": 100,
    "description": "Pagamento de conta",
    "transactionDate": "2023-12-01T10:00:00.000Z",
    "account": {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente",
      "balance": 900
    },
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

**Tipos de transação válidos:** `Débito`, `Crédito`, `Transferência`

#### 2. Listar Transações
**GET** `/transactions`

Retorna todas as transações com filtros opcionais.

**Query Parameters:**
- `accountId` (number): Filtrar por conta
- `type` (string): Filtrar por tipo
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)

**Exemplo:** `GET /transactions?accountId=1&type=Débito&startDate=2023-12-01&endDate=2023-12-31`

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "Débito",
      "amount": 100,
      "description": "Pagamento de conta",
      "transactionDate": "2023-12-01T10:00:00.000Z",
      "account": {
        "id": 1,
        "name": "Conta Corrente Banco X",
        "type": "Corrente"
      },
      "destinationAccount": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

#### 3. Buscar Transação por ID
**GET** `/transactions/:id`

Retorna uma transação específica.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "Débito",
    "amount": 100,
    "description": "Pagamento de conta",
    "transactionDate": "2023-12-01T10:00:00.000Z",
    "account": {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente"
    },
    "destinationAccount": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### 4. Atualizar Transação
**PUT** `/transactions/:id`

Atualiza uma transação existente (reverte a transação original e executa a nova).

**Body:**
```json
{
  "amount": 150,
  "description": "Pagamento de conta atualizado"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Transação atualizada com sucesso",
  "data": {
    "id": 1,
    "type": "Débito",
    "amount": 150,
    "description": "Pagamento de conta atualizado",
    "transactionDate": "2023-12-01T10:00:00.000Z",
    "account": {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente",
      "balance": 850
    },
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  }
}
```

#### 5. Remover Transação
**DELETE** `/transactions/:id`

Remove uma transação (reverte automaticamente os saldos).

**Resposta (200):**
```json
{
  "success": true,
  "message": "Transação removida com sucesso"
}
```

#### 6. Realizar Transferência
**POST** `/transactions/transfer`

Realiza uma transferência entre contas.

**Body:**
```json
{
  "amount": 500,
  "description": "Transferência entre contas",
  "accountId": 1,
  "destinationAccountId": 2
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Transferência realizada com sucesso",
  "data": {
    "id": 1,
    "type": "Transferência",
    "amount": 500,
    "description": "Transferência entre contas",
    "transactionDate": "2023-12-01T10:00:00.000Z",
    "account": {
      "id": 1,
      "name": "Conta Corrente Banco X",
      "type": "Corrente",
      "balance": 500
    },
    "destinationAccount": {
      "id": 2,
      "name": "Conta Poupança Banco Y",
      "type": "Poupança",
      "balance": 10500
    },
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### 7. Transações por Conta
**GET** `/transactions/account/:accountId`

Retorna todas as transações de uma conta específica (incluindo transferências onde a conta é origem ou destino).

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "Débito",
      "amount": 100,
      "description": "Pagamento de conta",
      "transactionDate": "2023-12-01T10:00:00.000Z",
      "account": {
        "id": 1,
        "name": "Conta Corrente Banco X",
        "type": "Corrente"
      },
      "destinationAccount": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

#### 8. Estatísticas das Transações
**GET** `/transactions/statistics`

Retorna estatísticas das transações com filtros opcionais.

**Query Parameters:**
- `accountId` (number): Filtrar por conta
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 10,
    "totalAmount": 5000,
    "byType": {
      "Débito": {
        "count": 5,
        "totalAmount": 2500
      },
      "Crédito": {
        "count": 3,
        "totalAmount": 3000
      },
      "Transferência": {
        "count": 2,
        "totalAmount": 1000
      }
    }
  }
}
```

### Health Check

#### Status do Servidor
**GET** `/health`

Retorna o status atual do servidor.

**Resposta (200):**
```json
{
  "success": true,
  "message": "Servidor funcionando corretamente",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "environment": "development"
}
```

## 🚨 Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Nome da conta é obrigatório"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Conta não encontrada"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Não é possível excluir uma conta que possui transações"
}
```

### 422 - Unprocessable Entity
```json
{
  "success": false,
  "message": "Saldo insuficiente"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro (apenas em desenvolvimento)"
}
```

## 📝 Exemplos de Uso

### Fluxo Completo de Transferência

1. **Criar conta de origem:**
```bash
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conta Corrente",
    "type": "Corrente",
    "initialBalance": 1000
  }'
```

2. **Criar conta de destino:**
```bash
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conta Poupança",
    "type": "Poupança",
    "initialBalance": 0
  }'
```

3. **Realizar transferência:**
```bash
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "description": "Transferência para poupança",
    "accountId": 1,
    "destinationAccountId": 2
  }'
```

4. **Verificar saldos:**
```bash
curl http://localhost:3001/api/accounts
```

### Consultas com Filtros

**Transações de uma conta específica:**
```bash
curl "http://localhost:3001/api/transactions?accountId=1"
```

**Transações por período:**
```bash
curl "http://localhost:3001/api/transactions?startDate=2023-12-01&endDate=2023-12-31"
```

**Transações de débito de uma conta:**
```bash
curl "http://localhost:3001/api/transactions?accountId=1&type=Débito"
```

## 🔧 Rate Limiting

A API implementa rate limiting para proteger contra abuso:
- **Limite**: 100 requisições por IP
- **Janela**: 15 minutos
- **Resposta de erro:**
```json
{
  "success": false,
  "message": "Muitas requisições. Tente novamente mais tarde."
}
```

## 📊 Validações

### Contas
- Nome: obrigatório, não vazio
- Tipo: deve ser um dos valores válidos
- Saldo inicial: número não negativo

### Transações
- Tipo: deve ser um dos valores válidos
- Valor: número positivo
- Conta de origem: obrigatória
- Data: formato de data válido

### Transferências
- Conta de destino: obrigatória
- Saldo suficiente na conta de origem
- Contas de origem e destino devem ser diferentes 