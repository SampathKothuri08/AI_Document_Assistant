const { OpenAI } = require('@langchain/openai');
const { DocumentService } = require('./documentService');

class ChatService {
  constructor() {
    this.documentService = new DocumentService();
    this.openai = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1
    });
  }

  async generateAnswer(question, userId, documentIds = null) {
    try {
      // Search for relevant document chunks
      const searchResults = await this.documentService.searchSimilarChunks(question, userId, 5);
      
      if (!searchResults.documents || searchResults.documents.length === 0) {
        return {
          answer: "I couldn't find any relevant information in your documents to answer this question. Please make sure you have uploaded documents and try asking a different question.",
          citations: [],
          confidence: 0
        };
      }

      // Prepare context from search results
      const contextChunks = searchResults.documents[0];
      const contextMetadatas = searchResults.metadatas[0];
      const contextDistances = searchResults.distances[0];

      // Filter by document IDs if specified
      let filteredChunks = contextChunks;
      let filteredMetadatas = contextMetadatas;
      let filteredDistances = contextDistances;

      if (documentIds && documentIds.length > 0) {
        const filteredIndices = contextMetadatas
          .map((metadata, index) => ({ metadata, index }))
          .filter(({ metadata }) => documentIds.includes(metadata.documentId))
          .map(({ index }) => index);

        filteredChunks = filteredIndices.map(index => contextChunks[index]);
        filteredMetadatas = filteredIndices.map(index => contextMetadatas[index]);
        filteredDistances = filteredIndices.map(index => contextDistances[index]);
      }

      if (filteredChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the selected documents to answer this question.",
          citations: [],
          confidence: 0
        };
      }

      // Create context string
      const contextString = filteredChunks
        .map((chunk, index) => {
          const metadata = filteredMetadatas[index];
          const distance = filteredDistances[index];
          return `[Document: ${metadata.filename}, Chunk ${metadata.chunkIndex + 1}, Relevance: ${(1 - distance).toFixed(3)}]\n${chunk}\n`;
        })
        .join('\n---\n');

      // Generate answer using OpenAI
      const prompt = `Based on the following document excerpts, please answer the user's question. 
      
If the information is not available in the provided context, say so clearly. 
Provide specific citations to the source documents when possible.

Context:
${contextString}

Question: ${question}

Answer:`;

      const response = await this.openai.invoke(prompt);

      // Extract citations from the context
      const citations = filteredMetadatas.map((metadata, index) => ({
        filename: metadata.filename,
        chunkIndex: metadata.chunkIndex + 1,
        relevance: (1 - filteredDistances[index]).toFixed(3),
        content: filteredChunks[index].substring(0, 200) + '...'
      }));

      // Calculate confidence based on average relevance
      const avgRelevance = filteredDistances.reduce((sum, distance) => sum + (1 - distance), 0) / filteredDistances.length;

      return {
        answer: response,
        citations,
        confidence: avgRelevance.toFixed(3),
        sources: [...new Set(citations.map(c => c.filename))]
      };

    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error('Failed to generate answer');
    }
  }

  async getChatHistory(userId) {
    // In a real application, this would fetch from a database
    // For now, we'll return an empty array
    return [];
  }

  async saveChatMessage(userId, question, answer, metadata = {}) {
    // In a real application, this would save to a database
    // For now, we'll just log it
    console.log('Chat message saved:', {
      userId,
      question,
      answer: answer.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
}

module.exports = { ChatService }; 