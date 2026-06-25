# D.O.S. — Daniel OS

Site pessoal de produtividade, finanças e saúde. Next.js + Supabase + Netlify Functions.

## 1. Criar a base de dados (Supabase)

1. Vai a [supabase.com](https://supabase.com) → cria projeto novo (grátis)
2. Vai a **SQL Editor** → cola o conteúdo de `supabase-schema.sql` → Run
3. Vai a **Project Settings → API** → copia `Project URL` e `anon public key`

## 2. Correr localmente (opcional, para testar antes do deploy)

```bash
npm install
cp .env.example .env.local
# preenche .env.local com os valores do Supabase (pelo menos estes dois para já)
npm run dev
```

Abre `localhost:3000`.

## 3. Publicar no Netlify

1. Sobe esta pasta para um repositório no GitHub (cria um repo novo, faz push)
2. No Netlify: **Add new site → Import an existing project** → escolhe o repo
3. Build command: `npm run build` · Publish directory: `.next` (já vem configurado em `netlify.toml`)
4. Antes do deploy, vai a **Site settings → Environment variables** e mete:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy. O site fica já no ar com Tarefas, Finanças (manual), Check-ins.

## 4. Ligar as integrações (cada uma é opcional e independente)

### Trading212 (carteira automática)
1. App Trading212 → Settings → API (Beta) → gera uma chave **só de leitura**
2. Netlify → Environment variables → `TRADING212_API_KEY`
3. Liga o botão "Carteira automática" na página Finanças do site (por implementar na UI — a function já está pronta em `netlify/functions/trading212.js`)

### Notícias
Usa o RSS do Google News — gratuito, sem chave API nenhuma. Já funciona automaticamente na aba Notícias.

### Saúde (Apple Watch via Health Auto Export)
1. Segue as instruções no topo de `netlify/functions/health.js` para criar a conta de serviço Google
2. Netlify → Environment variables → `GOOGLE_SERVICE_ACCOUNT_JSON` e `HEALTH_DRIVE_FOLDER_ID`
3. Partilha a pasta "Health Auto Export" no Drive com o email da conta de serviço

### Casa (Home Assistant)
Por implementar quando tiveres o HA a correr — a estrutura da aba já existe, só falta apontar para o IP local/URL do teu HA.

### Adicionar tarefas via agente externo (ex: Cowork a ler o email)
1. Gera uma chave secreta qualquer (ex: `openssl rand -hex 32`)
2. Netlify → Environment variables → `TASKS_API_SECRET`
3. O agente faz `POST` a `https://<o-teu-site>.netlify.app/.netlify/functions/add-task` com:
   - Header `Authorization: Bearer <TASKS_API_SECRET>`
   - Body JSON `{ "text": "...", "area": "PESSOAL" | "FINANÇAS", "due": "YYYY-MM-DD" }` (`area` e `due` são opcionais)
4. A tarefa aparece na lista a seguir a abrires o site — escreve diretamente no `kv_store`, o mesmo sítio onde o site guarda as tarefas.

## Notas

- Tudo o que estava em `window.storage` no protótipo agora vive em `kv_store` no Supabase (`lib/storage.js`) — persistência real, não se perde nunca.
- As chaves API nunca tocam no browser — vivem só nas Netlify Functions, no servidor.
- Se mudares de fornecedor de hosting no futuro, só precisas de portar as 3 functions em `netlify/functions/` para o equivalente (ex: Vercel API routes).
