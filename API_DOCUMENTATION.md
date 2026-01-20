# API Documentation

Complete API reference for the AI-Powered Customer Support Chat Platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "..."
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    }
  }
}
```

---

## Chat Endpoints

### List User's Chats

```http
GET /chats
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "_id": "...",
        "title": "Help with billing",
        "user": "user_id",
        "status": "active",
        "messageCount": 5,
        "lastMessage": {
          "content": "Thank you for your help!",
          "createdAt": "..."
        },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### Create Chat

```http
POST /chats
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Conversation"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "chat": {
      "_id": "...",
      "title": "New Conversation",
      "user": "user_id",
      "status": "active",
      "createdAt": "..."
    }
  }
}
```

### Get Chat

```http
GET /chats/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chat": { ... }
  }
}
```

### Delete Chat

```http
DELETE /chats/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

### Get Chat Messages

```http
GET /chats/:id/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "...",
        "chat": "chat_id",
        "role": "user",
        "content": "How do I reset my password?",
        "createdAt": "..."
      },
      {
        "_id": "...",
        "chat": "chat_id",
        "role": "assistant",
        "content": "To reset your password...",
        "sources": [
          { "type": "faq", "title": "Password Reset" }
        ],
        "tokenCount": {
          "prompt": 150,
          "completion": 100,
          "total": 250
        },
        "createdAt": "..."
      }
    ],
    "pagination": { ... }
  }
}
```

### Send Message

```http
POST /chats/:id/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "How do I reset my password?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "_id": "...",
      "role": "user",
      "content": "How do I reset my password?",
      "createdAt": "..."
    },
    "assistantMessage": {
      "_id": "...",
      "role": "assistant",
      "content": "To reset your password, follow these steps...",
      "sources": [ ... ],
      "tokenCount": { ... },
      "createdAt": "..."
    }
  }
}
```

---

## Document Endpoints (Admin)

### List Documents

```http
GET /documents
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search query
- `status` (string): Filter by status (active, inactive, processing)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "...",
        "title": "User Guide",
        "originalName": "user_guide.pdf",
        "fileType": "pdf",
        "fileSize": 1024000,
        "status": "active",
        "content": "...",
        "uploadedBy": { ... },
        "createdAt": "..."
      }
    ],
    "pagination": { ... }
  }
}
```

### Upload Document

```http
POST /documents/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `document` (file): The file to upload
- `title` (string): Document title
- `description` (string, optional): Document description

**Supported File Types:** PDF, DOC, DOCX, TXT, MD

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "_id": "...",
      "title": "User Guide",
      "originalName": "user_guide.pdf",
      "fileType": "pdf",
      "fileSize": 1024000,
      "status": "processing",
      "createdAt": "..."
    }
  }
}
```

### Get Document

```http
GET /documents/:id
Authorization: Bearer <admin_token>
```

### Update Document

```http
PUT /documents/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "inactive"
}
```

### Delete Document

```http
DELETE /documents/:id
Authorization: Bearer <admin_token>
```

---

## FAQ Endpoints

### List FAQs

```http
GET /faqs
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search query
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "_id": "...",
        "question": "How do I reset my password?",
        "answer": "To reset your password...",
        "category": "Account",
        "tags": ["password", "account", "security"],
        "isActive": true,
        "priority": 1,
        "createdAt": "..."
      }
    ],
    "pagination": { ... }
  }
}
```

### Create FAQ (Admin)

```http
POST /faqs
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "question": "How do I reset my password?",
  "answer": "To reset your password, click 'Forgot Password' on the login page...",
  "category": "Account",
  "tags": ["password", "account"],
  "isActive": true
}
```

### Get FAQ

```http
GET /faqs/:id
```

### Update FAQ (Admin)

```http
PUT /faqs/:id
Authorization: Bearer <admin_token>
```

### Delete FAQ (Admin)

```http
DELETE /faqs/:id
Authorization: Bearer <admin_token>
```

---

## Admin Endpoints

### Get Analytics

```http
GET /admin/analytics
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalChats": 500,
    "totalDocuments": 25,
    "totalFAQs": 50,
    "activeUsersToday": 45,
    "messagesToday": 200,
    "recentChats": [ ... ],
    "topDocuments": [ ... ]
  }
}
```

### List All Users

```http
GET /admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`, `limit`, `search`, `role`

### Update User Role

```http
PUT /admin/users/:id/role
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

### Update User Status

```http
PUT /admin/users/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

### List All Chats

```http
GET /admin/chats
Authorization: Bearer <admin_token>
```

---

## User Endpoints

### Get Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

### Change Password

```http
PUT /users/password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are rate limited:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **AI chat endpoints**: 20 requests per minute

When rate limited, you'll receive:

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

With header:
```
Retry-After: 60
```

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /chats?page=2&limit=10
```

**Response includes:**
```json
{
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```
