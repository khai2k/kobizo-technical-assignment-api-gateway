# API Gateway Documentation

## Overview

This API Gateway provides authentication and proxy endpoints for Directus CMS integration. It follows the Backend For Frontend (BFF) pattern and includes comprehensive error handling, validation, and security features.

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": <response-data>,
  "error": "<error-message>",
  "message": "<status-message>"
}
```

## Endpoints

### 1. Health Check

#### GET /health

Check the health status of the API Gateway.

**Request:**

```bash
curl -X GET http://localhost:3001/health
```

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "service": "API Gateway"
}
```

---

### 2. Authentication Endpoints

#### POST /api/v1/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Validation Rules:**

- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `first_name`: Optional, minimum 1 character
- `last_name`: Optional, minimum 1 character

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-here",
    "expires": 1704067200000,
    "user": {
      "id": "1",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "status": "active",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Registration successful"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

---

#### POST /api/v1/auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules:**

- `email`: Valid email format, required
- `password`: Minimum 6 characters, required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-here",
    "refresh_token": "directus-refresh-token",
    "expires": 1704067200000,
    "user": {
      "id": "1",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "status": "active",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Login successful"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

#### POST /api/v1/auth/logout

Logout user (client-side token removal).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### GET /api/v1/auth/me

Get current authenticated user information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "status": "active",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "User information retrieved"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Product Endpoints

#### GET /api/v1/products

Get all products (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Product Name",
      "slug": "product-name",
      "price": 99.99,
      "description": "Product description",
      "stock_quantity": 10,
      "image_url": "https://example.com/product-image.jpg",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Retrieved 1 products"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### GET /api/v1/products/:id

Get a specific product by ID (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Product Name",
    "slug": "product-name",
    "price": 99.99,
    "description": "Product description",
    "stock_quantity": 10,
    "image_url": "https://example.com/product-image.jpg"
  },
  "message": "Product retrieved successfully"
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Product not found",
  "message": "Product not found"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Blog Endpoints

#### GET /api/v1/blog

Get all blog posts.

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Getting Started with Next.js",
      "slug": "getting-started-with-nextjs",
      "content": "This is a comprehensive guide to Next.js development...",
      "author": "John Doe",
      "published_date": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Retrieved 1 blog posts"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/v1/blog
```

---

#### GET /api/v1/blog/:slug

Get a specific blog post by slug.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "content": "This is a comprehensive guide to Next.js development...",
    "author": "John Doe",
    "published_date": "2023-01-01T00:00:00Z"
  },
  "message": "Blog post retrieved successfully"
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Blog post not found",
  "message": "Blog post not found"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/v1/blog/getting-started-with-nextjs
```

---

### 5. Checkout Endpoints

#### POST /api/v1/checkout

Process checkout and validate stock availability (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Validation Rules:**

- `items`: Array with minimum 1 item, required
- `items.*.productId`: Positive integer, required
- `items.*.quantity`: Positive integer, required

**Response (200 OK) - All items in stock:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "All items are available. Checkout can proceed.",
    "stockCheck": [
      {
        "productId": 1,
        "productName": "Product 1",
        "requestedQuantity": 2,
        "availableStock": 10,
        "isAvailable": true
      },
      {
        "productId": 2,
        "productName": "Product 2",
        "requestedQuantity": 1,
        "availableStock": 5,
        "isAvailable": true
      }
    ],
    "totalItems": 3,
    "canProceed": true
  },
  "message": "Stock validation successful"
}
```

**Response (400 Bad Request) - Insufficient stock:**

```json
{
  "success": false,
  "error": "Insufficient stock",
  "data": {
    "success": false,
    "message": "The following items are out of stock or insufficient quantity: Product 1",
    "stockCheck": [
      {
        "productId": 1,
        "productName": "Product 1",
        "requestedQuantity": 5,
        "availableStock": 2,
        "isAvailable": false
      }
    ],
    "totalItems": 5,
    "canProceed": false
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ]
  }'
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Validation failed"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Access token required",
  "message": "Access token required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Route /api/v1/nonexistent not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response when exceeded**: 429 Too Many Requests

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling without information leakage

## Environment Variables

| Variable            | Description             | Default               |
| ------------------- | ----------------------- | --------------------- |
| `PORT`              | Server port             | 3001                  |
| `NODE_ENV`          | Environment             | development           |
| `DIRECTUS_URL`      | Directus instance URL   | http://localhost:8055 |
| `DIRECTUS_EMAIL`    | Directus admin email    | -                     |
| `DIRECTUS_PASSWORD` | Directus admin password | -                     |
| `JWT_SECRET`        | JWT signing secret      | -                     |
| `JWT_EXPIRES_IN`    | JWT expiration time     | 24h                   |
| `CORS_ORIGIN`       | CORS allowed origin     | http://localhost:3000 |

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Development

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
api-gateway/
├── src/
│   ├── config/
│   │   └── directus.ts          # Directus service configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── product.controller.ts # Product logic
│   │   ├── checkout.controller.ts # Checkout logic
│   │   └── blog.controller.ts  # Blog logic
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   └── error.middleware.ts # Error handling
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication routes
│   │   ├── product.routes.ts   # Product routes
│   │   ├── checkout.routes.ts  # Checkout routes
│   │   └── blog.routes.ts      # Blog routes
│   ├── tests/
│   │   ├── auth.test.ts        # Auth tests
│   │   ├── product.test.ts     # Product tests
│   │   ├── checkout.test.ts   # Checkout tests
│   │   ├── blog.test.ts       # Blog tests
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
└── README.md                   # Project documentation
```

## Next Steps

1. **Frontend Integration**: Connect with Next.js frontend
2. **Additional Endpoints**: Add more proxy endpoints as needed
3. **Caching**: Implement Redis caching for better performance
4. **Monitoring**: Add application monitoring and metrics
5. **Documentation**: API documentation with Swagger/OpenAPI
