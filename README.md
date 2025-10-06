# API Gateway

A Node.js/Express API Gateway built with TypeScript that provides authentication and proxy endpoints for Directus CMS integration.

## Features

- **Authentication**: User sign-up and sign-in endpoints using Directus authentication
- **Proxy Endpoints**: GET /api/v1/products endpoint that fetches product data from Directus
- **JWT Token Management**: Secure token-based authentication
- **Error Handling**: Comprehensive error handling and validation
- **TypeScript**: Full TypeScript support with strict type checking
- **Testing**: Unit and integration tests with Jest
- **Security**: Rate limiting, CORS, and security headers

## Architecture

This API Gateway follows the Backend For Frontend (BFF) pattern:

```
Frontend (Next.js) → API Gateway (Express) → Directus CMS
```

### Components

1. **Directus Instance**: CMS/Backend for content management
2. **Node.js API Gateway**: Middleware layer handling authentication and business logic
3. **Next.js Frontend**: User interface (to be implemented)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Directus instance running (see directus-local setup)

## Installation

1. **Clone and navigate to the API Gateway directory:**
   ```bash
   cd api-gateway
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_EMAIL=admin@example.com
   DIRECTUS_PASSWORD=admin123
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:3000
   ```

## Development

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
npm start
```

**Run tests:**
```bash
npm test
npm run test:watch
```

**Lint code:**
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

### Authentication

#### POST /api/v1/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "directus-refresh-token",
    "expires": 1234567890,
    "user": {
      "id": "1",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "status": "active"
    }
  },
  "message": "Login successful"
}
```

#### POST /api/v1/auth/register
Register a new user.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

#### POST /api/v1/auth/logout
Logout (client-side token removal).

#### GET /api/v1/auth/me
Get current user information (requires authentication).

### Products

#### GET /api/v1/products
Get all products (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "Electronics",
      "image": "product.jpg",
      "stock": 10,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Retrieved 1 products"
}
```

#### GET /api/v1/products/:id
Get a specific product by ID (requires authentication).

## Project Structure

```
api-gateway/
├── src/
│   ├── config/
│   │   └── directus.ts          # Directus service configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   └── product.controller.ts # Product logic
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   └── error.middleware.ts # Error handling
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication routes
│   │   └── product.routes.ts   # Product routes
│   ├── tests/
│   │   ├── auth.test.ts        # Auth tests
│   │   ├── product.test.ts     # Product tests
│   │   └── setup.ts            # Test setup
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   └── index.ts                # Application entry point
├── .eslintrc.json              # ESLint configuration
├── jest.config.js              # Jest configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling without information leakage

## Testing

The project includes comprehensive tests:

- **Unit Tests**: Individual function and method testing
- **Integration Tests**: API endpoint testing
- **Mocking**: Directus service mocking for isolated testing

Run tests with coverage:
```bash
npm test -- --coverage
```

## Error Handling

The API Gateway includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Authentication Errors**: Proper JWT token validation
- **Directus Errors**: Graceful handling of Directus API errors
- **Server Errors**: Generic error handling for unexpected issues

## Logging

Structured logging with different levels:

- **Error**: Critical errors and exceptions
- **Warn**: Warning messages
- **Info**: General information and requests
- **Debug**: Detailed debugging information (development only)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DIRECTUS_URL` | Directus instance URL | http://localhost:8055 |
| `DIRECTUS_EMAIL` | Directus admin email | - |
| `DIRECTUS_PASSWORD` | Directus admin password | - |
| `DIRECTUS_TOKEN` | Directus static token | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## Health Check

The API Gateway includes a health check endpoint:

```
GET /health
```

Returns server status and timestamp.

## Next Steps

1. **Frontend Integration**: Connect with Next.js frontend
2. **Additional Endpoints**: Add more proxy endpoints as needed
3. **Caching**: Implement Redis caching for better performance
4. **Monitoring**: Add application monitoring and metrics
5. **Documentation**: API documentation with Swagger/OpenAPI
