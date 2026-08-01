# CrimeLens Makefile
.PHONY: dev dev-backend dev-frontend build test clean install

# Default command: Start both frontend & backend
dev:
	@echo "🚀 Starting CrimeLens Full-Stack Development Servers..."
	@npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"

# Start backend only
dev-backend:
	@echo "⚙️ Starting CrimeLens Backend..."
	@cd backend && npm run dev

# Start frontend only
dev-frontend:
	@echo "🎨 Starting CrimeLens Frontend..."
	@cd frontend && npm run dev

# Build production bundle
build:
	@echo "📦 Building Frontend Production Bundle..."
	@cd frontend && npm run build
	@echo "⚙️ Testing Backend Syntax..."
	@cd backend && node -c src/server.js

# Install dependencies for both backend and frontend
install:
	@echo "📥 Installing Backend Dependencies..."
	@cd backend && npm install
	@echo "📥 Installing Frontend Dependencies..."
	@cd frontend && npm install

# Run backend syntax tests
test:
	@echo "🧪 Running Backend Syntax & Service Verification..."
	@cd backend && node -c src/server.js
	@cd backend && node -c src/services/aiService.js
	@echo "✅ Syntax Verification Passed!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning dist and build artifacts..."
	@rm -rf frontend/dist
	@echo "✅ Clean Completed!"
