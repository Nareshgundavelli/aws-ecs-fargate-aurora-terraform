# Cloudmart Frontend

React + Vite frontend for the CloudMart application.

## Structure

```
frontend/
├── src/              # React source code
├── public/           # Static assets
├── Dockerfile
├── package.json
├── vite.config.js
├── nginx.conf
├── .dockerignore
├── .gitignore
├── .env.example
└── README.md
```

## Commands

```bash
npm install
npm run dev
npm run build
```

## Environment Variables

See `.env.example`. Set `VITE_API_URL` to the backend API base URL.
