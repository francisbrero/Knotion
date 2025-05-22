# Knotion Deployment Guide

This document provides detailed instructions for deploying Knotion to Vercel.

## Prerequisites

- A GitHub repository with your Knotion codebase
- A Vercel account
- Google OAuth credentials

## Setting Up Vercel Project

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project with the following settings:

### Build Settings

- Framework Preset: Next.js
- Build Command: Leave as default (uses `vercel.json`)
- Output Directory: `.next`

### Environment Variables

Add the following environment variables:

```
DATABASE_URL=file:/var/data/knotion.db
NEXTAUTH_URL=https://your-production-domain.vercel.app
NEXTAUTH_SECRET=your-secure-secret-string
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

### Production Deployment

Once your environment is configured, click "Deploy" to start the deployment process.

## Setting Up GitHub Actions

The GitHub Actions workflow in `.github/workflows/ci.yml` will run tests and verify the build on every PR.

To use it:
1. Ensure your repository has GitHub Actions enabled
2. Push to your main branch or create a PR
3. Check the "Actions" tab in your GitHub repository to see the workflow run

## Vercel SQLite Configuration

Knotion uses SQLite for data storage. On Vercel:

1. The SQLite database file is stored at `/var/data/knotion.db`
2. This location is automatically mounted as a persistent volume
3. The `vercel.json` configuration includes all necessary Prisma files

## Troubleshooting

If you encounter deployment issues:

1. Check Vercel build logs for errors
2. Verify that all environment variables are set correctly
3. Ensure that the `vercel.json` file is at the root of your repository
4. Check that Prisma migrations are running correctly during the build process

## Post-Deployment Verification

After deployment, verify that:

1. The application loads correctly
2. Google OAuth login works
3. Database operations function properly
4. Chrome extension can connect to your deployed API

## Database Backups (Optional)

For production deployments, consider setting up regular database backups:

1. Create a scheduled GitHub Action to export the SQLite database
2. Store backups in a secure location (e.g., S3, Google Cloud Storage) 