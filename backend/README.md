# Cloudmart Backend

Node.js REST API for the CloudMart application.

## Structure

```
backend/
├── src/
│   ├── server.js     # Express server entry point
│   ├── db.js         # Database connection module
│   └── routes/       # API route handlers
├── Dockerfile
├── package.json
├── .dockerignore
├── .gitignore
├── .env.example
└── README.md
```

## Commands

```bash
npm install
npm start
npm run dev
```

## Environment Variables

See `.env.example` for the required environment variables.

## Image Upload (S3)

`POST /api/upload` accepts a multipart `image` file, uploads it to S3 under the
`products/` prefix, and returns `{ url, key }`. The URL is stored in Aurora as a
product's `image_url` (images are never stored in the database).

Public read access is provided by the S3 **bucket policy** (not object ACLs), so the
upload code does **not** pass `ACL: 'public-read'`. This is required because the bucket
uses **Object Ownership = Bucket owner enforced**, which rejects ACLs. Credentials come
from the ECS task role, which is scoped to the exact bucket and `products/` prefix.
