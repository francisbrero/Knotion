# Knotion

A web highlight and annotation tool with threaded discussions built on the [T3 Stack](https://create.t3.gg/).

## Features

- In-page highlighting & threaded comments (Chrome extension)
- Cloud-backed link store with tags & collections
- Invite-only collaboration
- Google SSO auth

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build Chrome extension
pnpm extension:build
```

## Deployment

Knotion is configured for automated deployment to Vercel.

### Vercel Deployment Steps

1. Connect your GitHub repository to a Vercel project
2. Add the following environment variables in your Vercel project settings:
   - `DATABASE_URL="file:/var/data/knotion.db"`  
   - `NEXTAUTH_URL="https://your-production-url.vercel.app"`
   - `NEXTAUTH_SECRET="your-secure-nextauth-secret"`  
   - `GOOGLE_CLIENT_ID="your-google-client-id"`
   - `GOOGLE_CLIENT_SECRET="your-google-client-secret"`
   - Pusher credentials if using real-time features

3. Deploy your application to Vercel

The CI pipeline will automatically:
- Run tests on GitHub Actions for each PR
- Build and deploy your app on Vercel when merged to main

### SQLite on Vercel

Knotion uses SQLite for simplicity. On Vercel:
- The database is stored at `/var/data/knotion.db`
- Prisma migrations run automatically during build

## Technologies

- Next.js 14
- TypeScript
- tRPC
- Tailwind CSS
- NextAuth
- Prisma with SQLite
- shadcn/ui
- Pusher Channels (real-time)
- Chrome Manifest V3 extension
