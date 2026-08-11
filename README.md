  # ☁️ CloudMart

  > **A complete, production-ready e-commerce application deployed on AWS.**

  Welcome to **CloudMart** — a full-stack, cloud-native e-commerce application. This documentation is written as a **complete deployment book** for beginners. If you have never seen this project before, start here and follow every step from scratch.

  This guide assumes **zero prior knowledge** and explains:

  - **What** CloudMart is and how it works.
  - **Why** each AWS service is used.
  - **How** to install every tool on your machine.
  - **How** to deploy the entire application to AWS.
  - **How** to verify, monitor, and troubleshoot the deployment.
  - **How** to destroy everything when you are done.

  ---

  ## Table of Contents

  1. [What is CloudMart?](#what-is-cloudmart)
  2. [Complete AWS Architecture](#complete-aws-architecture)
  3. [Project Features](#project-features)
  4. [Project Structure](#project-structure)
  5. [Prerequisites](#prerequisites)
  6. [AWS Login (Configure Credentials)](#aws-login)
  7. [Clone the Project](#clone-project)
  8. [Run the Frontend Locally](#frontend)
  9. [Run the Backend Locally](#backend)
  10. [Docker Build & Run](#docker)
  11. [Amazon ECR (Image Registry)](#amazon-ecr)
  12. [Terraform Backend (State Management)](#terraform-backend)
  13. [Infrastructure (Every AWS Resource)](#infrastructure)
  14. [Application Deployment Flow](#application-deployment)
  15. [Database (Aurora MySQL)](#database)
  16. [API Reference](#api)
  17. [Frontend Pages](#frontend-pages)
  18. [CloudWatch (Logs & Monitoring)](#cloudwatch)
  19. [Route53 (DNS)](#route53)
  20. [Verify the Deployment](#verify-deployment)
  21. [Troubleshooting](#troubleshooting)
  22. [Destroy Everything](#destroy)

  ---

  ## What is CloudMart?

  CloudMart is a **shopping website** that lets users:

  - Browse and search for products.
  - View product details and pricing.
  - Add new products (with image upload).
  - Place orders.

  Behind the scenes it is made of **three main parts**:

  1. **A frontend** — the website you see in the browser (React).
  2. **A backend** — the API that handles requests and data (Node.js + Express).
  3. **A database** — where all products, orders, and users are stored (Aurora MySQL).

  The whole thing runs on **Amazon Web Services (AWS)** using **containers** — lightweight, self-contained packages of software that run the same everywhere.

  ---

  ## Complete AWS Architecture

  Here is the full architecture. Every arrow shows how **data flows** through the system.

  ```
                            ┌─────────────────────────┐
                            │        Internet          │
                            │  (Users in a browser)    │
                            └────────────┬────────────┘
                                        │  HTTPS / DNS lookup
                                ┌────────▼────────┐
                                │     Route 53     │  <-- DNS name (e.g. dev.cloudmart.example.com)
                                └────────┬────────┘
                                        │  Points to ALB
                                ┌────────▼────────┐
                                │       ALB        │  <-- Application Load Balancer (public)
                                └────────┬────────┘
                                        │  Routes traffic
                  ┌─────────────────────┼─────────────────────┐
                  ▼                     ▼                     ▼
          ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
          │  Frontend ECS  │    │  Backend ECS   │    │  (static files )│
          │  (nginx React) │    │ (Node Express) │    └────────────────┘
          │   Fargate      │    │    Fargate     │
          └───────┬────────┘    └───────┬────────┘
                  │                     │  SQL queries (port 3306)
                  │                     ▼
                  │            ┌────────────────┐
                  │            │  Aurora MySQL  │  <-- private, Multi-AZ
                  │            │   (database)   │
                  │            └───────┬────────┘
                  │                    │
                  ▼                    ▼
          ┌────────────────┐    ┌────────────────┐
          │   CloudWatch    │    │      S3        │  <-- product images
          │  logs & metrics │    │ (image bucket) │
          └────────────────┘    └────────────────┘
  ```

  ### How everything connects

  | Component | Connects To | Purpose |
  |-----------|-------------|---------|
  | **Internet** | Route53 | Users reach the site by a domain name |
  | **Route53** | Application Load Balancer (ALB) | DNS resolves to the ALB's public IP |
  | **ALB** | Frontend ECS + Backend ECS | Routes traffic to the right service by path |
  | **Frontend ECS** | Backend ECS | Sends `/api/*` requests to the backend |
  | **Backend ECS** | Aurora MySQL | Reads/writes products, orders, categories |
  | **Backend ECS** | S3 | Uploads and reads product images |
  | **Aurora MySQL** | CloudWatch | Ships database logs & metrics |
  | **ECS services** | CloudWatch | Ships container logs & CPU/memory metrics |
  | **S3** | Browser (via image URL) | Serves product images directly |

  ---

  ## Project Features

  ### 🖥️ React Frontend
  - Built with **React** and **Vite** (a fast build tool).
  - Uses **React Router** for multiple pages (Home, Products, Details, Add Product).
  - Uses **Axios** to call the backend API.
  - Fully **responsive** — works on phones, tablets, and desktops.

  ### ⚙️ Node Backend
  - Built with **Node.js** and **Express**.
  - Provides a **REST API** for products, categories, orders, health, and uploads.
  - Uses **mysql2** to talk to MySQL.
  - Uses **connection pooling** for performance.
  - Uses **Multer** + **AWS SDK** to upload images to S3.

  ### 🗄️ Aurora MySQL
  - A managed, **highly available** MySQL database on AWS.
  - **Multi-AZ** — data is replicated across availability zones for durability.
  - **Serverless v2** — scales compute automatically.
  - Stores all products, orders, categories, users, and order items.

  ### 🚀 ECS Fargate
  - **Amazon ECS (Elastic Container Service)** runs Docker containers.
  - **Fargate** launch type means AWS manages the servers for you (no EC2 to manage).
  - Runs the **frontend** and **backend** as separate services.
  - Auto-scales based on CPU/memory usage.

  ### 🧱 Terraform
  - **Infrastructure as Code (IaC)** tool.
  - Every AWS resource is defined in code in the `terraform/` folder.
  - Repeatable — you can create/dev/staging environments with one command.
  - `terraform apply` creates all resources; `terraform destroy` removes them.

  ### 🌐 Route53
  - AWS's **DNS service**.
  - Maps your custom domain (e.g. `cloudmart.example.com`) to the ALB.
  - Supports separate records for `dev` and `staging` environments.

  ### 📊 CloudWatch
  - AWS's **monitoring and logging** service.
  - Collects **container logs** from ECS.
  - Collects **database logs** from Aurora.
  - Tracks **CPU, memory**, and **database metrics**.
  - Shows a **dashboard** with all metrics in one place.

  ### 🖼️ Amazon S3
  - **Simple Storage Service** — stores files in the cloud.
  - Stores **product images** uploaded by users.
  - The database stores only the **image URL**, not the file itself.
  - Images are served directly to the browser from S3.
  - **Object Ownership = `BucketOwnerEnforced`** — ACLs are disabled entirely (AWS best practice).
  - Public read access is granted via a **bucket policy** (`s3:GetObject` to `*`), **not** object ACLs.
  - The ECS **task role** is scoped to the exact bucket and `products/` prefix only (least privilege), so uploads happen only from the backend.

  ---

  ## Project Structure

  Here is every folder and file explained.

  ```text
  ecs-fargate/
  │
  ├── backend/                # Node.js + Express API
  │   ├── src/                # Source code
  │   │   ├── server.js       # Server entry point (starts Express)
  │   │   ├── db.js           # MySQL connection pool (mysql2)
  │   │   └── routes/         # API route modules
  │   │       ├── index.js    # Aggregates all routes
  │   │       ├── health.js   # GET /health
  │   │       ├── products.js # Product CRUD + search
  │   │       ├── categories.js # Category list + create
  │   │       ├── orders.js   # POST /api/orders
  │   │       ├── upload.js   # POST /api/upload (S3)
  │   │       └── schema.js   # Creates database tables
  │   ├── Dockerfile          # How to build the backend image
  │   ├── package.json        # Backend dependencies
  │   ├── .env.example        # Example environment variables
  │   └── .dockerignore       # Files excluded from Docker build
  │
  ├── frontend/               # React + Vite SPA
  │   ├── src/                # React source code
  │   │   ├── main.jsx        # Entry point (wraps app in Router)
  │   │   ├── App.jsx         # Main layout + routes
  │   │   ├── App.css         # All styles
  │   │   ├── api.js          # Axios API client
  │   │   ├── components/     # Reusable UI pieces
  │   │   │   ├── Navbar.jsx      # Top navigation bar
  │   │   │   ├── SearchBar.jsx   # Product search box
  │   │   │   └── ProductCard.jsx # Product card in grids
  │   │   └── pages/          # Full pages
  │   │       ├── HomePage.jsx          # Homepage
  │   │       ├── ProductsPage.jsx      # Product listing + filter
  │   │       ├── ProductDetailsPage.jsx # Single product + order
  │   │       └── AddProductPage.jsx    # Add product form
  │   ├── public/             # Static assets
  │   ├── index.html          # HTML entry point
  │   ├── nginx.conf          # nginx config for serving the SPA
  │   ├── Dockerfile          # Multi-stage build (Vite -> nginx)
  │   ├── package.json        # Frontend dependencies
  │   ├── vite.config.js      # Vite config (dev proxy)
  │   └── .env.example        # Example frontend env vars
  │
  ├── terraform/              # Infrastructure as Code
  │   ├── main.tf             # Root module (wires everything)
  │   ├── variables.tf        # Input variables
  │   ├── outputs.tf          # Outputs (ALB DNS, ECR URLs, etc.)
  │   ├── provider.tf         # AWS provider config
  │   ├── versions.tf         # Terraform + provider versions
  │   ├── locals.tf           # Local helper values
  │   ├── dev.tfvars          # Dev environment values
  │   ├── staging.tfvars      # Staging environment values
  │   ├── terraform.tfvars.example # Example values template
  │   └── modules/            # Reusable Terraform modules
  │       ├── vpc/            # VPC, subnets, gateways, routes
  │       ├── security_groups/# ALB, ECS, DB security groups
  │       ├── iam/            # ECS execution & task roles
  │       ├── ecr/            # Docker image repositories
  │       ├── ecs/            # Cluster, task defs, services
  │       ├── alb/            # Load balancer, listeners, target groups
  │       ├── aurora/         # Aurora MySQL cluster
  │       ├── s3/             # S3 bucket for images
  │       ├── route53/        # DNS records
  │       └── cloudwatch/     # Log groups, alarms, dashboard
  │
  ├── docker-compose.yml      # Run the whole stack locally with one command
  ├── README.md               # This documentation
  ├── LICENSE                 # MIT license
  └── .gitignore              # Files Git should ignore
  ```

  > **Note:** There is no `docker/` folder in this project. Docker configuration lives in each service's `Dockerfile`.

  ---

  ## Prerequisites

  Before you can run or deploy CloudMart, you need to install these tools on your computer.

  ### 1. Git
  Git downloads the project and tracks changes.

  - **Windows:** Download from https://git-scm.com and install.
  - **macOS:** `brew install git`
  - **Linux:** `sudo apt install git`

  **Verify:**
  ```bash
  git --version
  ```
  **Expected output (yours may be newer):**
  ```
  git version 2.40.0.windows.1
  ```

  ### 2. AWS CLI
  The AWS Command Line Interface lets you control AWS from your terminal.

  **Install (Windows):** Download the installer from https://aws.amazon.com/cli/ and run it.

  **Verify:**
  ```bash
  aws --version
  ```
  **Expected output:**
  ```
  aws-cli/2.15.0 Python/3.11.6 Windows/10 exe/AMD64
  ```

  ### 3. Terraform
  Terraform creates and manages the AWS infrastructure.

  **Install (Windows):** Download from https://developer.hashicorp.com/terraform/downloads and add the binary to your PATH.

  **Verify:**
  ```bash
  terraform -version
  ```
  **Expected output:**
  ```
  Terraform v1.7.0
  on windows_amd64
  ```

  ### 4. Docker Desktop
  Docker builds and runs containers. You also need it to push images to ECR.

  **Install (Windows):** Download from https://www.docker.com/products/docker-desktop/ and install. Start Docker Desktop once.

  **Verify:**
  ```bash
  docker --version
  ```
  **Expected output:**
  ```
  Docker version 24.0.7, build afdd53b
  ```

  **Verify the daemon is running:**
  ```bash
  docker info
  ```
  **Expected output:** A long list of Docker details (no error).

  ### 5. Node.js
  Node.js runs the backend and builds the frontend.

  **Install:** Download the LTS version from https://nodejs.org.

  **Verify:**
  ```bash
  node -v
  ```
  **Expected output (yours may be newer):**
  ```
  v18.19.0
  ```

  **Verify npm:**
  ```bash
  npm -v
  ```
  **Expected output:**
  ```
  10.2.3
  ```

  ### 6. VS Code
  A free code editor. Optional but recommended.

  **Install:** Download from https://code.visualstudio.com.

  **Verify:** Open VS Code. You should see the editor window.

  ---

  ## AWS Login

  ### What is `aws configure`?
  `aws configure` stores your AWS credentials so the CLI (and Terraform) can call AWS.

  ```bash
  aws configure
  ```

  You will be prompted for four fields:

  | Field | What to enter |
  |-------|---------------|
  | **AWS Access Key ID** | Your IAM user's access key (e.g. `AKIAIOSFODNN7EXAMPLE`) |
  | **AWS Secret Access Key** | Your IAM user's secret key (e.g. `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`) |
  | **Default region name** | `us-east-1` (or your preferred region) |
  | **Default output format** | `json` |

  **How to get keys:** In the AWS Console, go to **IAM → Users → your user → Security Credentials → Create Access Key**. Save the secret key immediately (you only see it once).

  **Expected output:**
  ```
  AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
  AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  Default region name [None]: us-east-1
  Default output format [None]: json
  ```

  ### Verify you are logged in
  ```bash
  aws sts get-caller-identity
  ```
  **Expected output:**
  ```json
  {
      "UserId": "AIDA...EXAMPLE",
      "Account": "123456789012",
      "Arn": "arn:aws:iam::123456789012:user/your-username"
  }
  ```
  If you see your account ID and ARN, you are logged in successfully.

  ---

  ## Clone Project

  Get the project from Git.

  ```bash
  git clone <your-repository-url>
  cd ecs-fargate
  ```

  **Expected output:**
  ```
  Cloning into 'ecs-fargate'...
  remote: Enumerating objects: 100, done.
  ...
  Resolving deltas: 100% (100/100), done.
  ```

  **Verify success:**
  ```bash
  ls
  ```
  You should see `backend/`, `frontend/`, `terraform/`, `docker-compose.yml`, and `README.md`.

  ---

  ## Frontend

  The frontend is a React app. Let's install and run it locally.

  ### Install dependencies
  ```bash
  cd frontend
  npm install
  ```
  **What it does:** Downloads all libraries listed in `package.json` (React, Vite, React Router, Axios) into a `node_modules/` folder.

  **Expected output (end):**
  ```
  added 200 packages, and audited 201 packages in 15s
  ```

  ### Run the development server
  ```bash
  npm run dev
  ```
  **What it does:** Starts Vite's dev server with hot reload. Any change you save appears instantly in the browser.

  **Expected output:**
  ```
    VITE v5.4.0  ready in 300 ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
  ```

  **Verify:** Open `http://localhost:5173` in a browser. You should see the CloudMart homepage.

  > **Note:** In development, Vite proxies `/api` requests to `http://localhost:3000` (the backend). See `vite.config.js`.

  ### Build the production files
  ```bash
  npm run build
  ```
  **What it does:** Compiles and optimizes the React app into static files in the `dist/` folder. This is what nginx serves in production.

  **Expected output:**
  ```
  vite v5.4.0 building for production...
  ✓ 95 modules transformed.
  dist/index.html                   0.41 kB │ gzip:  0.27 kB
  dist/assets/index-CUul9g2K.css    9.50 kB │ gzip:  2.38 kB
  dist/assets/index-CQ7D1ksn.js   226.97 kB │ gzip: 75.63 kB
  ✓ built in 5.40s
  ```

  **Verify:** The `frontend/dist/` folder now contains your built website.

  ---

  ## Backend

  The backend is a Node.js API. Let's install and run it.

  ### Install dependencies
  ```bash
  cd backend
  npm install
  ```
  **What it does:** Downloads the backend libraries (Express, mysql2, etc.).

  **Expected output (end):**
  ```
  added 155 packages, and audited 155 packages in 20s
  ```

  ### Environment variables
  The backend reads its configuration from environment variables. Create a `.env` file:

  ```bash
  cp .env.example .env
  ```

  Open `.env` and fill in values:

  ```env
  PORT=3000
  NODE_ENV=development
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=cloudmart
  DB_USER=cloudmart_admin
  DB_PASSWORD=cloudmart_password
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=cloudmart-images
  ```

  | Variable | Purpose |
  |----------|---------|
  | `PORT` | The port the API listens on |
  | `NODE_ENV` | Development or production |
  | `DB_HOST` | Where the database is (use `localhost` for local MySQL) |
  | `DB_PORT` | MySQL port (default 3306) |
  | `DB_NAME` | The database name |
  | `DB_USER` | The database username |
  | `DB_PASSWORD` | The database password |
  | `AWS_REGION` | AWS region for S3 |
  | `AWS_S3_BUCKET` | S3 bucket for product images |

  ### Database connection
  The backend uses `mysql2` with **connection pooling** (see `backend/src/db.js`). It reads the environment variables above. It never hardcodes credentials.

  ### Run the server
  ```bash
  npm start
  ```
  **What it does:** Starts the Express server on port 3000 and initializes the database schema (creates tables if missing).

  **Expected output:**
  ```
  CloudMart backend running on port 3000
  Database schema initialized successfully
  Aurora MySQL connectivity verified
  ```

  > If you don't have a local MySQL running, you'll instead see a connection error. That's fine — the server still starts. Use Docker (below) to run a local MySQL.

  **Verify:** Open a new terminal and run:
  ```bash
  curl http://localhost:3000/health
  ```
  **Expected output:**
  ```json
  {"status":"healthy","database":"connected","timestamp":"2024-01-01T00:00:00.000Z"}
  ```

  ---

  ## Docker

  Docker packages the app so it runs identically everywhere, including on AWS.

  ### The Frontend Dockerfile
  File: `frontend/Dockerfile`
  ```dockerfile
  # Stage 1: build the React app
  FROM node:18-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  # Stage 2: serve the built files with nginx
  FROM nginx:1.25-alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```
  - **Stage 1** builds the React app into `dist/`.
  - **Stage 2** copies the built files into nginx and serves them on port 80.

  ### The Backend Dockerfile
  File: `backend/Dockerfile`
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --omit=dev
  COPY . .
  EXPOSE 3000
  CMD ["npm", "start"]
  ```
  - Installs production dependencies.
  - Copies the source.
  - Runs `npm start` on port 3000.

  ### Build an image
  ```bash
  docker build -t cloudmart-frontend ./frontend
  ```
  **What it does:** Builds the frontend image and names it `cloudmart-frontend`.

  **Expected output:**
  ```
  [+] Building 30.5s (13/13) FINISHED
  => exported to image
  ```

  ### List images
  ```bash
  docker images
  ```
  **Expected output:**
  ```
  REPOSITORY            TAG       IMAGE ID       CREATED        SIZE
  cloudmart-frontend    latest    a1b2c3d4e5f6   2 minutes ago   55MB
  ```

  ### Run a container
  ```bash
  docker run -d -p 8080:80 --name frontend cloudmart-frontend
  ```
  **What it does:** Runs the frontend container, mapping port 80 in the container to port 8080 on your machine.

  **Expected output:** A container ID (a long hex string).

  ### List running containers
  ```bash
  docker ps
  ```
  **Expected output:**
  ```
  CONTAINER ID   IMAGE                STATUS         PORTS
  12ab34cd56ef   cloudmart-frontend   Up 2 minutes   0.0.0.0:8080->80/tcp
  ```

  ### View logs
  ```bash
  docker logs frontend
  ```
  **What it does:** Shows logs from the container. Useful for debugging.

  **Expected output:** nginx access/error logs.

  ---

  ## Amazon ECR

  **Amazon ECR (Elastic Container Registry)** stores your Docker images in the cloud so ECS can pull them.

  ### Step 1: Get the repository URLs
  After running Terraform (see next section), get the URLs:
  ```bash
  cd terraform
  terraform output ecr_frontend_url
  terraform output ecr_backend_url
  ```
  **Expected output:**
  ```
  012345678901.dkr.ecr.us-east-1.amazonaws.com/cloudmart-dev/frontend
  012345678901.dkr.ecr.us-east-1.amazonaws.com/cloudmart-dev/backend
  ```

  ### Step 2: Login to ECR
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
  ```
  **What it does:** Authenticates Docker with ECR so you can push images.

  **Expected output:**
  ```
  Login Succeeded
  ```

  **Common error:** `Error response from daemon: Get ... denied`
  **Fix:** Make sure you're logged into AWS (`aws sts get-caller-identity`) and the account ID matches.

  ### Step 3: Tag your images
  Give your local images the ECR repository URL as a tag.
  ```bash
  docker tag cloudmart-frontend:latest <ecr_frontend_url>:latest
  docker tag cloudmart-backend:latest <ecr_backend_url>:latest
  ```
  **What it does:** Adds a new tag pointing at the same image.

  **Verify:**
  ```bash
  docker images
  ```
  You'll now see the ECR-URL-tagged images.

  ### Step 4: Push images
  ```bash
  docker push <ecr_frontend_url>:latest
  docker push <ecr_backend_url>:latest
  ```
  **What it does:** Uploads the images to ECR.

  **Expected output:**
  ```
  The push refers to repository [012345678901.dkr.ecr.us-east-1.amazonaws.com/cloudmart-dev/frontend]
  ...
  latest: digest: sha256:... size: 1234
  ```

  **Verify in AWS Console:** Go to **ECR → Repositories**. You'll see your frontend and backend repos with the `latest` tag.

  ---

  ## Terraform Backend

  Terraform needs a place to store its **state file** (which tracks what resources exist). We store it in S3 with DynamoDB locking.

  ### Step 1: Create the S3 state bucket
  ```bash
  aws s3api create-bucket --bucket cloudmart-terraform-state-us-east-1 --region us-east-1
  ```
  **What it does:** Creates a bucket to hold Terraform state.

  **Expected output:**
  ```json
  {
      "Location": "/cloudmart-terraform-state-us-east-1"
  }
  ```

  ### Step 2: Enable versioning
  ```bash
  aws s3api put-bucket-versioning --bucket cloudmart-terraform-state-us-east-1 --versioning-configuration Status=Enabled
  ```
  **What it does:** Keeps a history of state files so you can recover from mistakes.

  **Expected output:** *(no output = success)*

  ### Step 3: Create the DynamoDB lock table
  ```bash
  aws dynamodb create-table \
    --table-name cloudmart-terraform-locks \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
  ```
  **What it does:** Prevents two people from running `terraform apply` at the same time.

  **Expected output:** A long JSON describing the table.

  ### Step 4: Set the database password
  Terraform needs the Aurora database password. Never commit real passwords.
  ```bash
  export TF_VAR_database_password="YourStrongPassword123!"
  ```
  Or uncomment `database_password` in your `.tfvars` file.

  ### Step 5: Initialize Terraform
  ```bash
  cd terraform
  terraform init
  ```
  **What it does:** Downloads the AWS provider and installs all modules.

  **Expected output:**
  ```
  Terraform has been successfully initialized!
  ```

  ### Step 6: Validate
  ```bash
  terraform validate
  ```
  **What it does:** Checks the config is syntactically valid.

  **Expected output:**
  ```
  Success! The configuration is valid.
  ```

  ### Step 7: Plan
  ```bash
  terraform plan -var-file="dev.tfvars"
  ```
  **What it does:** Shows what AWS resources Terraform *will* create, without creating them.

  **Expected output:** A list of resources to be added, changed, or destroyed.

  ### Step 8: Apply
  ```bash
  terraform apply -var-file="dev.tfvars"
  ```
  **What it does:** Actually creates all the AWS resources.

  **Expected output (end):**
  ```
  Apply complete! Resources: 30 added, 0 changed, 0 destroyed.

  Outputs:
  alb_dns_name = "cloudmart-dev-alb-1234567890.us-east-1.elb.amazonaws.com"
  ```

  ---

  ## Infrastructure

  Here is every AWS resource Terraform creates and why it exists.

  ### VPC
  A **Virtual Private Cloud** is your own private network in AWS.
  - Isolates all your resources.
  - Spans multiple availability zones.

  ### Public Subnets
  Public subnets have internet access via the Internet Gateway.
  - The **ALB** lives here (it must be public).

  ### Private Subnets
  Private subnets have **no** direct internet access.
  - **ECS services** (frontend & backend) live here.
  - They reach the internet through a NAT Gateway.

  ### Database Subnets
  Dedicated subnets for the database.
  - **Aurora MySQL** lives here — fully private.

  ### Route Tables
  Rules that decide where network traffic goes.
  - Public route → Internet Gateway.
  - Private route → NAT Gateway.

  ### Internet Gateway (IGW)
  The "door" between your VPC and the internet.
  - Allows inbound/outbound traffic to public resources (like the ALB).

  ### NAT Gateway
  Allows **private** resources to make outbound internet calls (e.g. ECS pulling images) but **blocks inbound** calls.
  - Keeps private resources secure.

  ### Security Groups
  Virtual firewalls.
  - **ALB SG**: allows inbound HTTP/HTTPS from anywhere.
  - **ECS SG**: allows traffic from the ALB only.
  - **DB SG**: allows MySQL (3306) from the ECS SG only.
  - Aurora is **never** public.

  ### Application Load Balancer (ALB)
  Distributes incoming traffic across multiple ECS tasks.
  - Public (in public subnets).
  - Routes `/api/*` to the backend, everything else to the frontend.
  - Health-checks each target.

  ### Target Groups
  Groups of ECS tasks that receive traffic.
  - **Frontend target group** → port 80.
  - **Backend target group** → port 3000.
  - Each has a health check path.

  ### Aurora MySQL
  The managed, highly available database.
  - **Multi-AZ** (writer + reader instances).
  - **Serverless v2** scaling.
  - Private and encrypted.

  ### ECS Cluster
  A logical grouping of services/tasks.
  - Uses **Container Insights** for metrics.

  ### Task Definitions
  The "recipe" for each container.
  - Define the image, port, env vars, and logging.
  - Backend receives `DB_*` and `AWS_S3_BUCKET` env vars.

  ### IAM Roles
  Permissions for ECS.
  - **Execution role**: allows ECS to pull images and write logs.
  - **Task role**: allows the app to use S3 and Secrets Manager.

  ### CloudWatch
  Monitoring & logging.
  - Log groups for frontend and backend container logs.
  - Alarms for CPU/memory and ALB 5xx.
  - Dashboard with ECS + Aurora metrics.

  ### Route53
  DNS.
  - Maps your domain to the ALB via an A-alias record.

  ---

  ## Application Deployment

  Here is the complete flow from code to running website.

  ```
  Your Code
      │
      ▼
  Terraform (creates: VPC, ALB, ECS, Aurora, S3, ECR, etc.)
      │
      ▼
  ECR (stores the Docker images)
      │          docker build → docker push
      ▼
  ECS Fargate (pulls images from ECR, runs containers)
      │
      ▼
  ALB (routes traffic to the ECS services)
      │
      ▼
  Website (users reach it via Route53 / domain)
  ```

  1. **Terraform** creates all the infrastructure.
  2. **docker build** packages your code into images.
  3. **docker push** uploads images to **ECR**.
  4. **ECS** pulls the images and runs them on **Fargate**.
  5. **ALB** routes traffic to the running services.
  6. **Route53** points your domain to the ALB.

  ---

  ## Database

  The database is **Aurora MySQL** (MySQL 8.0 compatible), running in Multi-AZ Serverless v2.

  ### How the backend connects
  The backend uses **mysql2** with a connection pool. It reads these env vars (set in the ECS task definition):
  - `DB_HOST` — the Aurora endpoint.
  - `DB_PORT` — `3306`.
  - `DB_NAME` — `cloudmart`.
  - `DB_USER` — `cloudmart_admin`.
  - `DB_PASSWORD` — from Terraform.

  ### Database tables
  The schema is auto-created on startup (`backend/src/routes/schema.js`).

  **products**
  | Column | Type | Purpose |
  |--------|------|---------|
  | id | INT (PK) | Unique product ID |
  | name | VARCHAR | Product name |
  | description | TEXT | Product description |
  | category | VARCHAR | Category name |
  | brand | VARCHAR | Brand name |
  | price | DECIMAL | Price |
  | stock | INT | Quantity in stock |
  | image_url | TEXT | S3 URL of image |
  | status | ENUM | active / inactive / draft |
  | created_at | TIMESTAMP | When created |
  | updated_at | TIMESTAMP | When last updated |

  **categories**
  | Column | Type | Purpose |
  |--------|------|---------|
  | id | INT (PK) | Category ID |
  | name | VARCHAR (unique) | Category name |
  | description | TEXT | Category description |
  | created_at | TIMESTAMP | When created |

  **users**
  | Column | Type | Purpose |
  |--------|------|---------|
  | id | INT (PK) | User ID |
  | name | VARCHAR | User name |
  | email | VARCHAR (unique) | User email |
  | password_hash | VARCHAR | Hashed password |
  | created_at | TIMESTAMP | When created |

  **orders**
  | Column | Type | Purpose |
  |--------|------|---------|
  | id | INT (PK) | Order ID |
  | customer_name | VARCHAR | Customer name |
  | customer_email | VARCHAR | Customer email |
  | total_amount | DECIMAL | Order total |
  | status | VARCHAR | Order status |
  | created_at | TIMESTAMP | When created |

  **order_items**
  | Column | Type | Purpose |
  |--------|------|---------|
  | id | INT (PK) | Item ID |
  | order_id | INT (FK) | Links to orders |
  | product_id | INT (FK) | Links to products |
  | quantity | INT | Quantity ordered |
  | unit_price | DECIMAL | Price per unit |

  ---

  ## API

  The backend exposes a REST API. Here is every endpoint.

  ### GET /health
  Checks the server and database are up.

  ```bash
  curl http://localhost:3000/health
  ```
  **Response (200):**
  ```json
  {"status":"healthy","database":"connected","timestamp":"2024-01-01T00:00:00.000Z"}
  ```

  ### GET /api/products
  Lists all products. Optional `?category=` filter.

  ```bash
  curl "http://localhost:3000/api/products"
  ```
  **Response (200):**
  ```json
  [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "Noise cancelling headphones",
      "category": "Electronics",
      "brand": "SoundCo",
      "price": "99.99",
      "stock": 10,
      "image_url": "https://bucket.s3.amazonaws.com/products/abc.png",
      "status": "active"
    }
  ]
  ```

  ### GET /api/products/:id
  Gets one product.

  ```bash
  curl http://localhost:3000/api/products/1
  ```
  **Response (200):** A single product object (as above).

  ### GET /api/products/search?q=
  Searches products by name, description, category, or brand. Queries MySQL directly.

  ```bash
  curl "http://localhost:3000/api/products/search?q=headphones"
  ```
  **Response (200):** An array of matching products.

  ### POST /api/products
  Creates a product.

  ```bash
  curl -X POST http://localhost:3000/api/products \
    -H "Content-Type: application/json" \
    -d '{"name":"Keyboard","category":"Electronics","brand":"TypCo","price":49.99,"stock":20,"status":"active"}'
  ```
  **Response (201):** The created product object.

  ### PUT /api/products/:id
  Updates a product.

  ```bash
  curl -X PUT http://localhost:3000/api/products/1 \
    -H "Content-Type: application/json" \
    -d '{"price":89.99}'
  ```
  **Response (200):** The updated product object.

  ### DELETE /api/products/:id
  Deletes a product.

  ```bash
  curl -X DELETE http://localhost:3000/api/products/1
  ```
  **Response (200):**
  ```json
  {"message":"Product deleted successfully","id":1}
  ```

  ### POST /api/orders
  Places an order (validates stock, updates inventory, creates order + order_items in a transaction).

  ```bash
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customer_name":"Jane","items":[{"product_id":1,"quantity":2,"price":99.99}]}'
  ```
  **Response (201):**
  ```json
  {"order_id":1,"total_amount":199.98}
  ```

  ### GET /api/categories
  Lists categories.

  ### POST /api/categories
  Creates a category.

  ### POST /api/upload
  Uploads an image to S3 (multipart form field named `image`). Returns the S3 URL.

  ---

  ## Frontend Pages

  Here are the pages and which API each one calls.

  ### Home (`/`)
  - Shows a hero, search bar, categories, featured products, and latest products.
  - **API used:** `fetchFeaturedProducts()`, `fetchLatestProducts()`, `fetchCategories()`.

  ### Products (`/products`)
  - Lists all products, with a search bar and category filter.
  - **API used:** `fetchProducts(category)`, `searchProducts(q)`, `fetchCategories()`.

  ### Search
  - Built into the Products page. Typing a query calls `searchProducts(q)`.

  ### Product Details (`/products/:id`)
  - Shows full product info and an order form.
  - **API used:** `fetchProduct(id)`, `createOrder(...)`.

  ### Add Product (`/add-product`)
  - Form to add a product with image upload.
  - **API used:** `uploadImage(file)` (uploads to S3), then `createProduct(...)`.

  ### Cart
  - Checkout is handled on the Product Details page via the order form. (A full cart page can be added later.)

  ### Admin
  - Product management is done through the **Add Product** page. There is no separate admin page currently.

  ---

  ## CloudWatch

  CloudWatch collects logs and metrics from ECS and Aurora.

  ### Container logs
  - **Frontend logs:** `/ecs/cloudmart-<env>-frontend`
  - **Backend logs:** `/ecs/cloudmart-<env>-backend`

  **Check ECS logs (AWS CLI):**
  ```bash
  aws logs tail /ecs/cloudmart-dev-backend --follow
  ```
  **What it does:** Streams the backend container logs live.

  **In the Console:** **CloudWatch → Log groups →** select the log group.

  ### Aurora logs
  Aurora exports audit, error, general, and slow-query logs to CloudWatch.

  ```bash
  aws logs tail /aws/rds/cluster/cloudmart-dev-aurora/error --follow
  ```

  ### Monitoring & alarms
  - **Backend CPU/Memory** alarms.
  - **Frontend CPU/Memory** alarms.
  - **ALB 5xx** error alarm.
  - **Aurora CPU & free storage** alarms.
  - A **dashboard** named `cloudmart-<env>-dashboard` shows all key metrics.

  ---

  ## Route53

  Route53 maps your domain to the ALB.

  ### Custom domain
  Terraform creates an A-alias record from your domain to the ALB automatically if you set `domain_name` and `hosted_zone_id`.

  ```hcl
  # terraform.tfvars
  domain_name    = "cloudmart.example.com"
  hosted_zone_id = "ZXXXXXXXXXXXXX"
  ```

  ### ALB alias
  The record uses an **alias** pointing to the ALB's DNS name and zone ID. This is more reliable than a CNAME and supports the root domain.

  ### Multi-environment
  - `dev.cloudmart.example.com`
  - `staging.cloudmart.example.com`

  Each environment has its own ALB and its own Route53 record.

  ---

  ## Verify Deployment

  After deploying, verify each layer.

  ### 1. Terraform
  ```bash
  cd terraform
  terraform output alb_dns_name
  ```
  **Expected output:** The ALB DNS name.

  ### 2. ECR
  ```bash
  aws ecr describe-repositories --region us-east-1
  ```
  **Expected output:** JSON listing your repositories.

  ### 3. ECS
  ```bash
  aws ecs list-services --cluster cloudmart-dev-cluster --region us-east-1
  ```
  **Expected output:** The frontend and backend service names.

  ### 4. Target Groups
  ```bash
  aws elbv2 describe-target-groups --region us-east-1
  ```
  **Expected output:** JSON with your target groups.

  ### 5. ALB
  ```bash
  aws elbv2 describe-load-balancers --region us-east-1
  ```
  **Expected output:** JSON with the ALB's DNS name.

  ### 6. Aurora
  ```bash
  aws rds describe-db-clusters --region us-east-1
  ```
  **Expected output:** JSON with your Aurora cluster status.

  ### 7. Website
  Open the ALB DNS name in a browser:
  ```bash
  start http://<alb_dns_name>
  ```
  **Expected output:** The CloudMart homepage.

  ### 8. CloudWatch
  ```bash
  aws cloudwatch list-metrics --namespace AWS/ECS --region us-east-1
  ```
  **Expected output:** JSON with ECS metrics.

  ---

  ## Troubleshooting

  Here are common problems and exactly how to fix them.

  ### Docker Login Failed
  **Error:** `Error response from daemon: Get ... denied`
  **Fix:**
  ```bash
  aws sts get-caller-identity
  docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
  ```

  ### Terraform Backend Missing
  **Error:** `Error: Error acquiring the state lock` or `bucket not found`
  **Fix:**
  ```bash
  aws s3api create-bucket --bucket cloudmart-terraform-state-us-east-1 --region us-east-1
  ```
  Then `terraform init` again.

  ### Target Group Unhealthy
  **Symptoms:** ECS tasks show as unhealthy; ALB returns 503.
  **Fix:**
  - Check the backend starts and `/health` returns 200.
  - Check the backend target group health check path is `/health`.
  - Check the security groups allow the ALB to reach the ECS tasks.
  - Check the database is reachable (the backend health check fails if the DB is down).

  ### 503 Error
  **Cause:** No healthy targets.
  **Fix:** Same as "Target Group Unhealthy" above. Check ECS task logs.

  ### ECS Task Stopped
  **Symptoms:** Task shows "STOPPED".
  **Fix:**
  ```bash
  aws logs tail /ecs/cloudmart-dev-backend --follow
  ```
  Look for the actual error (e.g. DB connection failure, missing env var). Fix and redeploy.

  ### Aurora Connection Failed
  **Error:** `ECONNREFUSED` or `Access denied`.
  **Fix:**
  - Confirm `DB_HOST` is the Aurora endpoint.
  - Confirm the DB security group allows port 3306 from the ECS security group.
  - Confirm `DB_USER`/`DB_PASSWORD` are correct.
  - Confirm the database is in the same VPC.

  ### CloudWatch Logs Missing
  **Fix:** Verify the ECS task definition has `logConfiguration` with `awslogs` driver. Confirm the log group exists.

  ### Route53 DNS Not Working
  **Fix:**
  - Confirm `hosted_zone_id` is correct.
  - Confirm `domain_name` is set in `.tfvars`.
  - Wait for DNS propagation (can take minutes).
  - Run `nslookup yourdomain.com` to confirm it resolves to the ALB.

  ### Image Upload Fails: `AccessControlListNotSupported`
  **Error:** `The bucket does not allow ACLs` in CloudWatch logs.
  **Cause:** The S3 bucket uses **Object Ownership = Bucket owner enforced**, which rejects any ACL (e.g. `ACL: 'public-read'`).
  **Fix (already applied in this repo):**
  - `terraform/modules/s3/main.tf` sets Object Ownership to `BucketOwnerEnforced`, allows a public-read **bucket policy** (`s3:GetObject` to `*`), and keeps ACLs blocked.
  - `backend/src/routes/upload.js` no longer passes `ACL: 'public-read'`; public read comes from the bucket policy.
  - Re-run `terraform apply` and redeploy the backend.

  ### Image Not Visible / Opening S3 URL Returns `AccessDenied`
  **Cause:** The bucket blocks all public access (Public Access Block all `true`) and/or there is no bucket policy, so the image object is not publicly readable.
  **Fix (already applied in this repo):**
  - `terraform/modules/s3/main.tf` sets `block_public_policy = false` and `restrict_public_buckets = false` and adds a bucket policy granting `s3:GetObject` to `*`.
  - The ECS **task role** has `s3:PutObject`/`s3:GetObject` scoped to `arn:aws:s3:::bucket/products/*` so uploads still only happen from the backend.
  - Re-run `terraform apply`, then rebuild + redeploy the backend.

  ---

  ## Destroy

  When you're done, remove all resources to avoid ongoing AWS charges.

  ### Destroy the infrastructure
  ```bash
  cd terraform
  terraform destroy -var-file="dev.tfvars"
  ```
  **What it does:** Removes every resource Terraform created.
  **Expected output:** `Destroy complete! Resources: 30 destroyed.`

  ### Verify resources are deleted
  ```bash
  aws ecs list-clusters --region us-east-1
  aws rds describe-db-clusters --region us-east-1
  aws elbv2 describe-load-balancers --region us-east-1
  ```
  **Expected output:** Empty lists (or your resources no longer appear).

  ### About the S3 backend
  The **S3 state bucket** and **DynamoDB lock table** are created manually (not by Terraform), so `terraform destroy` does **not** remove them. This is intentional — it keeps your state safe.

  ```bash
  # Only delete state backend if you really want to
  aws s3 rb s3://cloudmart-terraform-state-us-east-1 --force
  aws dynamodb delete-table --table-name cloudmart-terraform-locks --region us-east-1
  ```

  ### When to delete the backend and when not to
  - **Do NOT delete** the S3 state bucket / DynamoDB table if you plan to redeploy or want to keep history.
  - **DO delete them** only after a full `terraform destroy` and when you're certain you no longer need the state.

  ---

  ## License

  MIT

  ---

  © CloudMart. Built with ❤️ and deployed on AWS.
