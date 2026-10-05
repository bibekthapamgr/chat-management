# chat-management

A dashboard for managing customer chats in one place. It connects Facebook Pages so you can read and reply to Messenger conversations from the web app.

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend:** PHP API (`backend/`) with a MySQL database
- **Integration:** Facebook Graph API (Pages + Messenger webhooks)

## Project structure

```
app/          Next.js pages (login, register, dashboard, settings) and API routes
components/   UI components (chat dashboard, chat interface, Facebook connection)
lib/          Auth context, types, and the Facebook service client
backend/      PHP endpoints, config, and SQL schema files
src/          Older React (react-router) version of the dashboard
```

## Getting started

### 1. Frontend

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

### 2. Backend (PHP + MySQL)

1. Create a MySQL database and import the schema files:
   ```bash
   mysql -u USER -p DATABASE < backend/setup.sql
   mysql -u USER -p DATABASE < backend/facebook-tables.sql
   ```
2. In `backend/config.php`, set your database host, name, username, and password, and replace `your_secret_key` with a long random string (used to sign login tokens).
3. Upload the `backend/` folder to a PHP host (for example, cPanel).

### 3. Environment variables

Create a `.env.local` file in the project root (it's already ignored by git):

```bash
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

## Notes

- The backend URL is currently written directly in several frontend files (for example `app/login/page.tsx`, `app/register/page.tsx`, `components/facebook-chat.tsx`, and `components/facebook-connection.tsx`). Update these if your backend lives somewhere else.
- Never commit real database passwords, secret keys, or Facebook tokens.

## Scripts

| Command      | What it does                 |
| ------------ | ---------------------------- |
| `pnpm dev`   | Start the development server |
| `pnpm build` | Build for production         |
| `pnpm start` | Run the production build     |
| `pnpm lint`  | Run the linter               |
