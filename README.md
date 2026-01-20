# AI-Powered Customer Support Chat Platform

A comprehensive, production-ready AI-powered customer support chat platform built with React, Node.js, Express, and MongoDB. Features real-time AI responses grounded in company documents and FAQs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

## 🚀 Features

### User Features
- **AI-Powered Chat**: Intelligent responses using OpenAI, Anthropic, Google, or DeepSeek
- **Document-Grounded AI**: Responses based on uploaded company documents and FAQs
- **Chat History**: Persistent conversation history with search
- **Real-time Responses**: Instant AI responses with typing indicators
- **Responsive Design**: Works seamlessly on desktop and mobile

### Admin Features
- **Document Management**: Upload PDF, DOCX, TXT, MD files
- **FAQ Management**: Create and manage frequently asked questions
- **User Management**: View, edit roles, and manage user accounts
- **Analytics Dashboard**: View usage statistics and insights
- **Conversation Monitoring**: Review all user conversations

### Technical Features
- **Provider-Agnostic AI**: Support for multiple AI providers
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access**: User, Admin, and Super Admin roles
- **Rate Limiting**: Protect APIs from abuse
- **File Processing**: Automatic content extraction from documents

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Document Processing**: pdf-parse, mammoth

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### AI Providers (Configurable)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- DeepSeek

## 📁 Project Structure

```
Chat_Bot/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, logger, constants
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, upload, rate limiting
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── scripts/         # Database seeding
│   │   └── server.js        # Entry point
│   ├── uploads/             # Uploaded documents
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Protected routes
│   │   │   ├── chat/        # Chat components
│   │   │   ├── common/      # Shared components
│   │   │   └── admin/       # Admin components
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   └── auth/        # Auth pages
│   │   ├── services/        # API service
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Utilities
│   │   └── App.jsx          # Main app
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- AI Provider API Key (OpenAI, Anthropic, Google, or DeepSeek)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chat_Bot
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Create environment file
   cp .env.example .env
   ```

4. **Configure Environment Variables**

   Backend `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ai_support_chat
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d
   
   # AI Provider (choose one)
   AI_PROVIDER=openai
   OPENAI_API_KEY=your-openai-api-key
   # ANTHROPIC_API_KEY=your-anthropic-api-key
   # GOOGLE_AI_API_KEY=your-google-api-key
   # DEEPSEEK_API_KEY=your-deepseek-api-key
   
   # AI Model
   AI_MODEL=gpt-4-turbo-preview
   AI_MAX_TOKENS=1000
   AI_TEMPERATURE=0.7
   ```

5. **Seed the Database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the Application**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Demo Credentials

After seeding:
- **Admin**: admin@example.com / Admin@123
- **User**: user@example.com / User@123

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | List user's chats |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/:id` | Get chat by ID |
| DELETE | `/api/chats/:id` | Delete chat |
| GET | `/api/chats/:id/messages` | Get chat messages |
| POST | `/api/chats/:id/messages` | Send message & get AI response |

### Documents (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents/:id` | Get document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

### FAQs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faqs` | List all FAQs |
| POST | `/api/faqs` | Create FAQ (Admin) |
| GET | `/api/faqs/:id` | Get FAQ |
| PUT | `/api/faqs/:id` | Update FAQ (Admin) |
| DELETE | `/api/faqs/:id` | Delete FAQ (Admin) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Get dashboard stats |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| PUT | `/api/admin/users/:id/status` | Toggle user status |
| GET | `/api/admin/chats` | List all chats |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |

## 🎨 Frontend Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/chat` | ChatPage | Authenticated |
| `/settings` | SettingsPage | Authenticated |
| `/admin` | AdminDashboard | Admin |
| `/admin/documents` | DocumentsPage | Admin |
| `/admin/faqs` | FAQsPage | Admin |
| `/admin/users` | UsersPage | Admin |
| `/admin/chats` | ChatsPage | Admin |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: express-validator on all routes
- **XSS Protection**: Helmet middleware
- **CORS**: Configured for frontend origin
- **File Validation**: Type and size restrictions on uploads

## 🤖 AI Configuration

The platform supports multiple AI providers. Configure via environment variables:

### OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview
```

### Anthropic (Claude)
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-3-opus-20240229
```

### Google (Gemini)
```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=...
AI_MODEL=gemini-pro
```

### DeepSeek
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
AI_MODEL=deepseek-chat
```

## 📱 Screenshots

### Landing Page
Modern, responsive landing page with feature highlights and CTAs.

### Chat Interface
ChatGPT-style interface with:
- Message bubbles with timestamps
- Typing indicators
- Source citations
- Copy and feedback buttons

### Admin Dashboard
Comprehensive admin panel with:
- Usage analytics
- Document management with drag-and-drop upload
- FAQ editor
- User management

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Docker

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude
- Google for Gemini
- The React and Node.js communities

---

Built with ❤️ for AI-powered customer support
