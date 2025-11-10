# 🚀 Guia de Deploy

Este documento fornece instruções detalhadas para fazer deploy da aplicação em diferentes ambientes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Deploy no Vercel](#deploy-no-vercel)
- [Deploy Manual](#deploy-manual)
- [Configuração do MongoDB Atlas](#configuração-do-mongodb-atlas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Verificação Pós-Deploy](#verificação-pós-deploy)
- [Troubleshooting](#troubleshooting)

## ✅ Pré-requisitos

- Conta no [Vercel](https://vercel.com) (recomendado)
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Node.js 22.x (LTS) instalado localmente (para deploy manual)

## 🌐 Deploy no Vercel (Recomendado)

### Passo 1: Preparar o Repositório

Certifique-se de que seu código está no GitHub, GitLab ou Bitbucket.

### Passo 2: Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em **"Add New Project"**
4. Importe seu repositório

### Passo 3: Configurar o Projeto

#### Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `yarn build`
- **Output Directory**: `.next` (padrão do Next.js)
- **Install Command**: `yarn install`

#### Environment Variables

Configure as seguintes variáveis no painel do Vercel:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `MONGODB_URI` | URI do MongoDB Atlas | Sim |
| `MONGODB_DB_NAME` | Nome do banco | Sim |
| `ADMIN_TOKEN` | Token secreto | Sim |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação | Sim |

**Como adicionar:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável
3. Selecione os ambientes (Production, Preview, Development)
4. Clique em **Save**

### Passo 4: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Acesse a URL fornecida pelo Vercel

### Passo 5: Configurar Domínio (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções de DNS

## 🔧 Deploy Manual

### Passo 1: Build Local

```bash
# Instalar dependências
yarn install

# Criar build de produção
yarn build
```

### Passo 2: Executar em Produção

```bash
# Iniciar servidor de produção
yarn start
```

### Passo 3: Usar PM2 (Recomendado para servidores)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "networking-app" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

## 🗄 Configuração do MongoDB Atlas

### Passo 1: Criar Cluster

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Faça login ou crie uma conta
3. Clique em **"Build a Database"**
4. Escolha o plano (Free tier disponível)
5. Configure região e nome do cluster

### Passo 2: Configurar Acesso

#### Database Access

1. Vá em **Security** → **Database Access**
2. Clique em **"Add New Database User"**
3. Escolha método de autenticação (Password)
4. Defina username e password
5. Atribua permissões: **Read and write to any database**
6. Clique em **"Add User"**

#### Network Access

1. Vá em **Security** → **Network Access**
2. Clique em **"Add IP Address"**
3. Para desenvolvimento: **"Allow Access from Anywhere"** (`0.0.0.0/0`)
4. Para produção: Adicione apenas IPs específicos
5. Clique em **"Confirm"**

### Passo 3: Obter Connection String

1. Vá em **Database** → **Connect**
2. Escolha **"Connect your application"**
3. Copie a connection string
4. Substitua `<password>` pela senha do usuário
5. Substitua `<dbname>` pelo nome do banco

**Exemplo:**
```
mongodb+srv://usuario:senha@cluster.mongodb.net/networking_group?retryWrites=true&w=majority
```

### Passo 4: Configurar no Vercel

Adicione a connection string na variável `MONGODB_URI` no Vercel.

## 🔐 Variáveis de Ambiente

### Produção

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/networking_group?retryWrites=true&w=majority
MONGODB_DB_NAME=networking_group
ADMIN_TOKEN=seu_token_super_secreto_aqui_minimo_32_caracteres
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### Preview/Staging

Use as mesmas variáveis, mas com valores diferentes:
- Banco de dados separado
- Token diferente
- URL do preview

### Desenvolvimento

Use `.env.local` (não commitar no Git).

## ✅ Verificação Pós-Deploy

### 1. Verificar Build

- [ ] Build completou sem erros
- [ ] Aplicação está acessível na URL
- [ ] Página inicial carrega corretamente

### 2. Verificar Conexão com MongoDB

- [ ] Aplicação conecta ao banco sem erros
- [ ] Logs não mostram erros de conexão

### 3. Testar Funcionalidades

- [ ] Formulário de intenção funciona
- [ ] APIs respondem corretamente
- [ ] Autenticação admin funciona

### 4. Verificar Performance

- [ ] Tempo de carregamento aceitável
- [ ] Sem erros no console do navegador
- [ ] Imagens e assets carregam corretamente

## 🐛 Troubleshooting

### Erro: "MongoDB connection failed"

**Solução:**
1. Verifique se a `MONGODB_URI` está correta
2. Verifique se o IP está na whitelist do MongoDB Atlas
3. Verifique se o usuário tem permissões corretas

### Erro: "Build failed"

**Solução:**
1. Verifique logs do build no Vercel
2. Execute `yarn build` localmente para ver erros
3. Verifique se todas as dependências estão no `package.json`

### Erro: "Environment variables not found"

**Solução:**
1. Verifique se todas as variáveis estão configuradas no Vercel
2. Verifique se estão marcadas para o ambiente correto (Production)
3. Faça redeploy após adicionar variáveis

### Erro: "Module not found"

**Solução:**
1. Verifique se todas as dependências estão no `package.json`
2. Execute `yarn install` localmente
3. Verifique se não há imports de arquivos inexistentes

### Performance Lenta

**Solução:**
1. Verifique logs do Vercel Analytics
2. Otimize queries do MongoDB
3. Use cache quando apropriado
4. Verifique tamanho do bundle

## 📊 Monitoramento

### Vercel Analytics

1. Ative Vercel Analytics no painel
2. Monitore performance e erros
3. Configure alertas

### MongoDB Atlas Monitoring

1. Acesse **Metrics** no MongoDB Atlas
2. Monitore uso de CPU, memória e conexões
3. Configure alertas para limites

### Logs

- **Vercel**: Acesse logs no painel do projeto
- **MongoDB**: Acesse logs no MongoDB Atlas
- **Aplicação**: Use `console.log` para debug (remover em produção)

## 🔄 Atualizações

### Deploy Automático

O Vercel faz deploy automático a cada push na branch `main`.

### Deploy Manual

1. Faça push para a branch `main`
2. O Vercel detectará e fará deploy automaticamente
3. Ou use o botão **"Redeploy"** no painel

### Rollback

1. Vá em **Deployments** no Vercel
2. Encontre o deployment anterior
3. Clique nos três pontos → **"Promote to Production"**

## 🔒 Segurança

### Boas Práticas

- ✅ Use tokens seguros e longos (mínimo 32 caracteres)
- ✅ Não commite `.env.local` no Git
- ✅ Use HTTPS em produção
- ✅ Configure CORS corretamente
- ✅ Limite acesso ao MongoDB Atlas por IP
- ✅ Use senhas fortes para MongoDB
- ✅ Rotacione tokens periodicamente

### Checklist de Segurança

- [ ] Todas as variáveis sensíveis estão no Vercel (não no código)
- [ ] MongoDB Atlas com IP whitelist configurado
- [ ] Tokens com tamanho adequado e complexidade
- [ ] HTTPS habilitado
- [ ] Headers de segurança configurados (ver `next.config.ts`)

## 📞 Suporte

Se encontrar problemas:

1. Consulte os logs do Vercel
2. Verifique a documentação do [Next.js](https://nextjs.org/docs)
3. Verifique a documentação do [MongoDB Atlas](https://docs.atlas.mongodb.com/)
4. Abra uma issue no repositório

---

**Boa sorte com o deploy! 🚀**

