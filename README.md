# Gestor Financeiro Pessoal - Backend

Backend completo para um sistema de gestão financeira pessoal, desenvolvido em **TypeScript** com Node.js, Express, TypeORM e SQLite.

## 🚀 Tecnologias Utilizadas

- **TypeScript** - Linguagem principal com tipagem estática
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Jest** - Framework de testes
- **ts-jest** - Suporte TypeScript para Jest

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd WebApp-Front-Finance
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
DB_DATABASE=database.sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=true
CORS_ORIGIN=*
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Seed do Banco de Dados
```bash
npm run seed
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── database.ts          # Configuração do TypeORM
├── controllers/
│   ├── AccountController.ts # Controlador de contas
│   └── TransactionController.ts # Controlador de transações
├── entities/
│   ├── Account.ts           # Entidade de conta
│   └── Transaction.ts       # Entidade de transação
├── middleware/
│   └── errorHandler.ts      # Middleware de tratamento de erros
├── routes/
│   ├── accountRoutes.ts     # Rotas de contas
│   └── transactionRoutes.ts # Rotas de transações
├── services/
│   ├── AccountService.ts    # Serviço de contas
│   └── TransactionService.ts # Serviço de transações
├── types/
│   └── index.ts             # Definições de tipos TypeScript
├── database/
│   └── seed.ts              # Script de seed
└── server.ts                # Servidor principal

tests/
├── entities/
│   ├── Account.test.ts      # Testes da entidade Account
│   └── Transaction.test.ts  # Testes da entidade Transaction
└── services/
    └── AccountService.test.ts # Testes do AccountService
```

## 🏗️ Arquitetura

### Princípios Aplicados

#### **Orientação a Objetos**
- **Encapsulamento**: Propriedades privadas com getters/setters
- **Herança**: Entidades herdam comportamentos da Entity
- **Polimorfismo**: Tratamento genérico de entidades
- **Abstração**: Interfaces bem definidas

#### **Clean Code**
- **Responsabilidade única**: Cada classe tem uma responsabilidade específica
- **Nomes descritivos**: Métodos e variáveis com nomes claros
- **Funções pequenas**: Métodos focados em uma tarefa
- **Tratamento de erros**: Validações e mensagens claras

#### **TypeScript**
- **Tipagem estática**: Interfaces e tipos bem definidos
- **Decorators**: Uso de decorators do TypeORM
- **Generics**: Uso de generics para repositórios
- **Strict mode**: Configuração rigorosa do TypeScript

### Camadas da Aplicação

1. **Controllers**: Responsáveis pelas requisições HTTP
2. **Services**: Lógica de negócio
3. **Entities**: Modelos de dados com validações
4. **Routes**: Definição de endpoints
5. **Middleware**: Tratamento de erros e validações

## 📊 Funcionalidades

### Contas Bancárias
- ✅ Criar conta
- ✅ Listar contas
- ✅ Buscar conta por ID
- ✅ Atualizar conta
- ✅ Remover conta
- ✅ Buscar contas por tipo
- ✅ Obter estatísticas
- ✅ Calcular saldo total

### Transações Financeiras
- ✅ Criar transação (Débito/Crédito)
- ✅ Listar transações
- ✅ Buscar transação por ID
- ✅ Atualizar transação
- ✅ Remover transação
- ✅ Realizar transferência entre contas
- ✅ Buscar transações por conta
- ✅ Obter estatísticas de transações

### Validações
- ✅ Validação de tipos de conta
- ✅ Validação de tipos de transação
- ✅ Validação de saldo suficiente
- ✅ Validação de dados obrigatórios
- ✅ Validação de datas

## 🧪 Testes

### Cobertura de Testes
- **Entidades**: 100% de cobertura
- **Serviços**: Testes unitários com mocks
- **Validações**: Testes de casos de sucesso e erro

### Executar Testes
```bash
# Todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🔧 Scripts Disponíveis

```json
{
  "build": "tsc",
  "start": "node dist/server.js",
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "seed": "ts-node src/database/seed.ts"
}
```

## 📚 Documentação da API

Consulte o arquivo `API_DOCUMENTATION.md` para documentação completa dos endpoints.

### Endpoints Principais

#### Contas
- `POST /api/accounts` - Criar conta
- `GET /api/accounts` - Listar contas
- `GET /api/accounts/:id` - Buscar conta
- `PUT /api/accounts/:id` - Atualizar conta
- `DELETE /api/accounts/:id` - Remover conta

#### Transações
- `POST /api/transactions` - Criar transação
- `POST /api/transactions/transfer` - Realizar transferência
- `GET /api/transactions` - Listar transações
- `GET /api/transactions/:id` - Buscar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Remover transação

## 🔒 Segurança

- **Helmet**: Headers de segurança
- **CORS**: Configuração de CORS
- **Rate Limiting**: Limitação de requisições
- **Input Validation**: Validação de entrada
- **Error Handling**: Tratamento centralizado de erros

## 🛡️ Validações e Segurança das APIs

Todas as rotas da API possuem validações rigorosas, incluindo:
- **Campos obrigatórios**: Não permite requisições sem os dados essenciais.
- **Validação de tipos**: Garante que os dados enviados estejam no formato correto.
- **Bloqueio de operações inválidas**: Impede ações como transações sem saldo, tipos inválidos, datas inconsistentes, etc.
- **Tratamento centralizado de erros**: Mensagens claras e status HTTP adequados para cada situação.

Essas validações garantem a integridade dos dados e a segurança das operações do sistema.

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3000
DB_SYNCHRONIZE=false
DB_LOGGING=false
CORS_ORIGIN=https://seu-dominio.com
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvedor - [Anderson Silveira]

## 📞 Suporte

Para suporte, envie um email para [anderson.silveira@tech4.com.br] ou abra uma issue no repositório.

---

**Nota**: Este projeto foi convertido de JavaScript para TypeScript para melhorar a qualidade do código, adicionar tipagem estática e facilitar a manutenção. 