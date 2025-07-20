# AI Mentor Buddy

A ChatGPT-like conversational AI career mentor built with React, Express, and TypeScript. Get personalized career guidance through an intelligent chat interface powered by OpenAI's GPT-4.

<img width="1425" height="779" alt="Screenshot 2025-07-20 223857" src="https://github.com/user-attachments/assets/a52f6452-f6e2-478c-97c0-863a48e611eb" />


## Features

- **ChatGPT-style Interface**: Clean, modern chat interface with sidebar navigation
- **AI-Powered Career Guidance**: Specialized career mentor using OpenAI GPT-4
- **Persistent Conversations**: Database storage for chat history and conversations
- **Real-time Chat**: Instant responses with typing indicators
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Export Conversations**: Download chat history as text files

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **OpenAI API** integration

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-mentor-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add to your environment or .env file
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_postgresql_connection_string
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── index.ts          # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json
```

## API Endpoints

- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get specific conversation with messages
- `POST /api/chat` - Send message and receive AI response
- `GET /api/conversations/:id/export` - Export conversation as text file

## Database Schema

### Conversations
- `id` - Primary key
- `title` - Conversation title
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Messages
- `id` - Primary key
- `conversationId` - Foreign key to conversations
- `role` - Message role ('user' or 'assistant')
- `content` - Message content
- `createdAt` - Creation timestamp

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes

### Key Features

1. **Career-Focused AI**: The AI is configured with a specialized system prompt for career mentoring
2. **Persistent Storage**: All conversations and messages are stored in PostgreSQL
3. **Real-time Updates**: Uses TanStack Query for automatic cache updates
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Type Safety**: Full TypeScript coverage with shared schemas

## Deployment

The application is designed to work on platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL support.

### Environment Variables Required

- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to 'production' for production builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please create an issue in the GitHub repository.
