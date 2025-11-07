Prerequisites
Before you begin, make sure you have the following software installed on your system:

Git: For cloning the repository.
Node.js: A recent version (LTS recommended).
pnpm: The package manager used for this monorepo. If you don't have it, you can install it with npm install -g pnpm.
Step 1: Clone the Repository
First, clone the project repository from your source control to a new directory on your local machine.

# Replace <repository-url> with the actual URL of your Git repository
git clone <repository-url>

# Navigate into the newly created project directory
cd <project-directory>
Step 2: Install All Project Dependencies
This is a monorepo, so you can install all the dependencies for both the backend (api) and the frontend (web) with a single command from the project's root directory.

pnpm install
This will read the pnpm-workspace.yaml file and set up all the packages correctly.

Step 3: Configure the Backend Environment
The backend server needs an environment file to store sensitive information.

Create the .env file: Inside the api/ directory, create a new file named .env.

Generate a Secret Key: For security, you need a strong, random secret key for signing authentication tokens (JWT). Run one of the following commands in your terminal to generate one:

# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
Add Configuration to .env: Copy the generated key and paste it into the api/.env file. The file should look like this:

# This tells Prisma to use a local SQLite database file.
DATABASE_URL="file:./dev.db"

# Replace this with the secure key you just generated.
JWT_SECRET="your-super-secret-and-randomly-generated-key"
Step 4: Set Up the Database
With the environment configured, you can now create the SQLite database and its schema.

Navigate to the API directory:

cd api
Run the Database Migration: This command reads your Prisma schema, creates the dev.db database file, and sets up the initial tables (User, Role, AuditLog).

pnpm exec dotenv -- prisma migrate dev --name init
Your database is now ready.

Step 5: Run the Full Application
You will need two separate terminals running at the same time: one for the backend and one for the frontend.

Terminal 1: Start the Backend Server

# Navigate to the api directory from the project root
cd api

# Start the backend server
pnpm dev
You should see a message confirming that the API server is running on port 3000.

Terminal 2: Start the Frontend Server

# Navigate to the web directory from the project root
cd web

# Start the frontend development server
pnpm dev
You should see a message with the local URL for the frontend, which is typically http://localhost:5173.

Step 6: Access and Use the Application
Open the Application: Open your web browser and go to http://localhost:5173.

Create Your Admin Account: The first time you load the login page, the application will automatically attempt to register a default Admin user with the following credentials (this is a temporary convenience for local setup):

Email: admin@test.com
Password: password
Log In: Use the credentials above to log in.

Start Building! You are now logged in and can:

Navigate to the Model Builder to define a new data model (e.g., "Employee").
Once a model is published, a link will appear in the sidebar. Click it to go to the data management page where you can perform CRUD operations.
Your entire development environment is now up and running.