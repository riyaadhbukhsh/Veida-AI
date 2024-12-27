#Replace API endpoint in the backend
cd veidaai

# Replace all occurrences of localhost:8080 with the production URL
find . -type f -name "*.js" -exec sed -i 's|http://localhost:8080|https://veida-ai-backend-production.up.railway.app|g' {} +
