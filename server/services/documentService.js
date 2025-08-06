const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Papa = require('papaparse');
const { ChromaClient } = require('chromadb');
const { OpenAIEmbeddings } = require('@langchain/openai');

// In-memory document storage for development
const documents = new Map();

class DocumentService {
  constructor() {
    this.chromaClient = new ChromaClient({
      path: process.env.CHROMA_DB_PATH || './chroma_db'
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002'
    });
  }

  async extractText(filePath, fileType) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      switch (fileType.toLowerCase()) {
        case 'pdf':
          const pdfData = await pdfParse(fileBuffer);
          return pdfData.text;
        
        case 'docx':
          const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
          return docxResult.value;
        
        case 'txt':
          return fileBuffer.toString('utf-8');
        
        case 'csv':
          const csvText = fileBuffer.toString('utf-8');
          const csvResult = Papa.parse(csvText, { header: true });
          return csvResult.data.map(row => Object.values(row).join(' ')).join('\n');
        
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${fileType} file`);
    }
  }

  async chunkText(text, chunkSize = 300) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  async createEmbeddings(chunks) {
    try {
      const embeddings = await this.embeddings.embedDocuments(chunks);
      return embeddings;
    } catch (error) {
      console.error('Embedding creation error:', error);
      throw new Error('Failed to create embeddings');
    }
  }

  async storeInVectorDB(documentId, chunks, embeddings, metadata) {
    try {
      const collection = await this.chromaClient.getOrCreateCollection({
        name: 'documents',
        metadata: { "hnsw:space": "cosine" }
      });

      const ids = chunks.map((_, index) => `${documentId}_chunk_${index}`);
      const metadatas = chunks.map((_, index) => ({
        ...metadata,
        chunkIndex: index,
        documentId
      }));

      await collection.add({
        ids,
        embeddings,
        documents: chunks,
        metadatas
      });

      return true;
    } catch (error) {
      console.error('Vector DB storage error:', error);
      throw new Error('Failed to store in vector database');
    }
  }

  async processDocument(filePath, originalName, userId) {
    try {
      const fileType = path.extname(originalName).substring(1);
      const documentId = uuidv4();
      
      // Extract text
      console.log(`Extracting text from ${originalName}...`);
      const text = await this.extractText(filePath, fileType);
      
      // Chunk text
      console.log(`Chunking text...`);
      const chunks = await this.chunkText(text);
      
      // Create embeddings
      console.log(`Creating embeddings for ${chunks.length} chunks...`);
      const embeddings = await this.createEmbeddings(chunks);
      
      // Store in vector DB
      console.log(`Storing in vector database...`);
      await this.storeInVectorDB(documentId, chunks, embeddings, {
        filename: originalName,
        userId,
        fileType,
        totalChunks: chunks.length,
        processedAt: new Date().toISOString()
      });
      
      // Store document metadata
      const document = {
        id: documentId,
        filename: originalName,
        userId,
        fileType,
        filePath,
        totalChunks: chunks.length,
        textLength: text.length,
        createdAt: new Date().toISOString(),
        status: 'processed'
      };
      
      documents.set(documentId, document);
      
      return document;
    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    }
  }

  async searchSimilarChunks(query, userId, limit = 5) {
    try {
      const collection = await this.chromaClient.getCollection({
        name: 'documents'
      });

      // Create query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Search for similar chunks
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: { userId }
      });

      return results;
    } catch (error) {
      console.error('Vector search error:', error);
      throw new Error('Failed to search documents');
    }
  }

  async getDocumentById(documentId) {
    return documents.get(documentId);
  }

  async getUserDocuments(userId) {
    return Array.from(documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async deleteDocument(documentId, userId) {
    const document = documents.get(documentId);
    if (!document || document.userId !== userId) {
      throw new Error('Document not found or access denied');
    }

    // Remove from vector DB
    try {
      const collection = await this.chromaClient.getCollection({
        name: 'documents'
      });
      
      // Get all chunk IDs for this document
      const results = await collection.get({
        where: { documentId }
      });
      
      if (results.ids.length > 0) {
        await collection.delete({
          ids: results.ids
        });
      }
    } catch (error) {
      console.error('Error deleting from vector DB:', error);
    }

    // Remove file
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Remove from memory
    documents.delete(documentId);
    
    return true;
  }
}

module.exports = { DocumentService }; 