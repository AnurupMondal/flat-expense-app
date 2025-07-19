#!/bin/bash
# Wait for the backend container to be ready and then create admin user
# This script will be executed after the schema is created

echo "Database schema initialized. Creating admin user..."

# Note: In a production environment, you would want to:
# 1. Use environment variables for admin credentials
# 2. Have a more robust waiting mechanism
# 3. Handle errors gracefully

# For now, the admin user creation will be handled manually or via npm script
echo "Run 'npm run create-admin' from the backend directory to create the admin user."
