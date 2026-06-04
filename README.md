# Atlas Estoque

Sistema web interno para controle de estoque, vendas e notas de frutas e verduras da CEASA.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Authentication
- Firestore Database
- Framer Motion

## Funcionalidades

- Login com Firebase Authentication.
- Dashboard com produtos, vendas do dia, estoque baixo e notas emitidas.
- CRUD de produtos.
- Entrada, saída e ajuste manual de estoque.
- PDV simples com edição de itens antes da finalização.
- Finalização de nota com baixa automática de estoque.
- Página limpa de impressão.
- Histórico de entradas, saídas, ajustes e vendas.
- Configurações de dados da empresa para sair na nota.

## Rodar localmente

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Inicie o servidor:

```bash
npm run dev -- -p 3001
```

Abra:

```txt
http://localhost:3001
```

## Firebase

No Firebase Console:

1. Ative Authentication por Email/Password.
2. Crie um usuário em Authentication.
3. Crie o Cloud Firestore em modo produção.
4. Publique regras permitindo acesso apenas a usuários autenticados.

Regras simples:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    match /users/{docId} {
      allow read, write: if signedIn();
    }

    match /products/{docId} {
      allow read, write: if signedIn();
    }

    match /sales/{docId} {
      allow read, write: if signedIn();
    }

    match /stock_movements/{docId} {
      allow read, write: if signedIn();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Deploy na Vercel

Antes do deploy, configure as mesmas variáveis do `.env.example` no painel da Vercel.

Depois do deploy, adicione o domínio gerado pela Vercel em:

```txt
Firebase Console -> Authentication -> Settings -> Authorized domains
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Observações de produção

Hoje a página de impressão e os dados da empresa usam armazenamento local do navegador como apoio. Para uso em vários computadores, a próxima etapa recomendada é salvar e buscar esses dados diretamente no Firestore.
