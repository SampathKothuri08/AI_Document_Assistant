# AI-Powered Document Q&A System

A full-stack Node.js + AI application that lets users upload documents (PDF, DOCX, TXT, CSV) and ask questions in natural language about the content.

## Features

- 📄 **Document Upload**: Support for PDF, DOCX, TXT, and CSV files
- 🤖 **AI-Powered Q&A**: Ask questions in natural language
- 🔍 **Vector Search**: Intelligent document chunking and embedding
- 📝 **Citations**: Answers include source document references
- 💬 **Chat Interface**: Persistent conversation history
- 🔐 **User Authentication**: JWT-based authentication system

## Tech Stack

### Backend
- Node.js + Express.js
- LangChain.js for AI orchestration
- OpenAI API for embeddings and Q&A
- ChromaDB for vector storage
- JWT for authentication

### Frontend
- React.js
- TailwindCSS for styling
- Axios for API calls

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key
   JWT_SECRET=your_jwt_secret
   ```

## Usage

1. **Upload a document** (PDF, DOCX, TXT, CSV)
2. **Wait for processing** (text extraction and embedding)
3. **Ask questions** in natural language
4. **Get answers** with citations to source documents

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/upload` - Document upload
- `POST /api/chat` - Ask questions
- `GET /api/documents` - List user documents



## License

MIT 