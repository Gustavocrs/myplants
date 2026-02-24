# MyPlants 🌱

**MyPlants** é uma aplicação Full Stack para gerenciamento de plantas domésticas. O sistema utiliza Inteligência Artificial (Google Gemini) para identificar espécies, sugerir cuidados e monitorar a saúde das plantas, além de enviar notificações automáticas por e-mail quando é hora de regar.

## ✨ Funcionalidades

- **📸 Identificação via IA:** Envie uma foto da sua planta e o sistema preenche automaticamente o nome científico, luminosidade ideal, intervalo de rega e se é _pet friendly_.
- **🩺 Diagnóstico de Saúde:** A IA analisa a imagem para detectar possíveis problemas de saúde na planta.
- **💧 Lembretes de Rega:** Sistema de notificação por e-mail (via SMTP) que avisa quando suas plantas precisam de água.
- **⚙️ Configurações Personalizadas:**
  - Configure seu próprio servidor SMTP (Gmail, Outlook, etc.).
  - Utilize sua própria chave de API do Google Gemini.
- **📊 Indicadores Visuais:** Cards com status de preenchimento de dados (Verde/Amarelo/Vermelho).
- **🔐 Autenticação:** Login seguro com Google (Firebase Auth).

## 🚀 Tecnologias

### Frontend

- **Next.js 14** (App Router)
- **Tailwind CSS** (Estilização)
- **Firebase Auth** (Autenticação)
- **React Icons**

### Backend

- **Node.js & Express**
- **MongoDB** (Banco de dados NoSQL)
- **Google Gemini AI** (Modelo `gemini-2.5-flash`)
- **Node-cron** (Agendamento de tarefas)
- **Nodemailer** (Envio de e-mails)

### Infraestrutura

- **Docker & Docker Compose**
- **Shell Scripts** para automação de deploy

---

## 📂 Estrutura do Projeto

```bash
.
├── api/                 # Backend (Express)
│   ├── controllers/     # Lógica de negócios
│   ├── models/          # Schemas do Mongoose
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (Notificação, Cron)
│   └── server.js        # Ponto de entrada da API
├── src/                 # Frontend (Next.js)
│   ├── app/             # Páginas e Layouts
│   ├── components/      # Componentes React (Modais, Cards)
│   ├── context/         # Context API (Auth)
│   └── services/        # Integração com API (fetch)
├── docker-compose.yml       # Configuração da API
├── docker-compose-mongo.yml # Configuração do Banco de Dados
└── deploy-*.sh              # Scripts de deploy
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose instalados.
- Node.js (v18+) instalado (para rodar o frontend localmente).
- Conta no Firebase (para autenticação).
- Chave de API do Google Gemini (opcional, mas recomendado).

### 1. Configuração de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto (para o Frontend) e um arquivo `.env` dentro da pasta `/api` (para o Backend).

**Frontend (`/.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# Configurações do Firebase (Obtenha no console do Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Backend (`/api/.env` ou variáveis no Docker):**

```env
PORT=3001
MONGO_URI=mongodb://root:example@mongodb:27017/myplants?authSource=admin
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
EMAIL_USER=seu_email_sistema@gmail.com
EMAIL_PASS=sua_senha_de_app
API_URL=http://localhost:3001/api
```

### 2. Rodando com Docker (Backend + Banco)

O projeto possui scripts facilitadores para subir a infraestrutura.

**Passo 1: Subir o MongoDB**

```bash
./deploy-myplants-mongo.sh
```

_Isso iniciará o container `myplants-mongodb` na porta 27017._

**Passo 2: Subir a API**

```bash
./deploy-myplants-api.sh
```

_Isso fará o build da API e iniciará o container `myplants-api` na porta 3001._

### 3. Rodando o Frontend

Como o `docker-compose.yml` atual foca na API, o frontend deve ser executado localmente (ou você pode criar um Dockerfile para ele).

```bash
# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação em: `http://localhost:3000`

---

## 📧 Configuração de E-mail (SMTP)

Para que os lembretes de rega funcionem:

1.  **Padrão do Sistema:** Configure `EMAIL_USER` e `EMAIL_PASS` no `.env` da API. Se usar Gmail, gere uma "Senha de App" nas configurações de segurança da sua conta Google.
2.  **Por Usuário:** Cada usuário pode configurar seu próprio SMTP clicando no ícone de engrenagem (⚙️) na interface, garantindo que os limites de envio sejam individuais.

## 🧠 Inteligência Artificial

O projeto usa o modelo `gemini-2.5-flash`.

- O usuário pode usar a chave de API padrão do sistema.
- Ou inserir sua própria chave nas configurações (⚙️) para evitar limites de cota compartilhada.

## 📝 Licença

Este projeto é de uso livre para fins educacionais e pessoais.
