# EC2 Manager Frontend

This is the frontend application for the EC2 Manager, built with [Next.js](https://nextjs.org).

## Getting Started

First, install the dependencies:

```bash
# Recommended
bun install
# or
npm install
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

### API Mocking

You can enable or disable API mocking by editing the `.env.local` file:

```dotenv
NEXT_PUBLIC_API_MOCKING=enabled # or disabled
```

When enabled, the application will use mock data instead of making actual API calls to AWS.

### Environment Variables

Create a `.env.local` file in this directory for local development settings. See `.env.local.example` (if available) for required variables.

## Building

To create a production build, run:

```bash
bun run build
```

## Deployment

This application is designed to be deployed as a Docker container on AWS ECS. See the `Dockerfile` and the root `README.md` for more details.
