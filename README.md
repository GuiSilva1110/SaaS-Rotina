# Planner Minimalista SaaS - React/Vite

Versão recriada e evoluída fora do Base44, pronta para rodar localmente e publicar.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build para produção

```bash
npm run build
```

## Publicar na Vercel

1. Suba essa pasta para um repositório no GitHub.
2. Entre na Vercel.
3. Clique em Add New Project.
4. Importe o repositório.
5. Framework: Vite.
6. Build command: `npm run build`.
7. Output directory: `dist`.

## O que esta versão tem

- Landing page comercial
- Login, cadastro e recuperação visual
- Dashboard interno
- Menu lateral estilo SaaS
- Página de hábitos
- Página de analytics
- Página de planos Free/Pro
- Página de configurações
- Persistência em localStorage
- Estrutura preparada para Supabase e pagamentos

## Próximos passos técnicos

- Trocar login local por Supabase Auth
- Criar tabela `habits`
- Criar tabela `profiles`
- Criar tabela `subscriptions`
- Integrar Mercado Pago ou Stripe
- Adicionar limite real no plano Free
- Publicar landing e app em domínio próprio
