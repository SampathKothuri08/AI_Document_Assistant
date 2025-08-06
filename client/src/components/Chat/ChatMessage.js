import React, { useState } from 'react';

const ChatMessage = ({ message }) => {
  const [showCitations, setShowCitations] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      case 'csv':
        return '📊';
      default:
        return '📄';
    }
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-75 mt-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="flex justify-start">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-75 mt-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'ai') {
    return (
      <div className="flex justify-start">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-xs lg:max-w-2xl shadow-sm">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Confidence and Sources */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  {message.confidence && (
                    <span>Confidence: {(parseFloat(message.confidence) * 100).toFixed(1)}%</span>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <span>{message.sources.length} source{message.sources.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <span>{formatTime(message.timestamp)}</span>
              </div>

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowCitations(!showCitations)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showCitations ? 'Hide' : 'Show'} citations ({message.citations.length})
                  </button>
                  
                  {showCitations && (
                    <div className="mt-2 space-y-2">
                      {message.citations.map((citation, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            <span>{getFileIcon(citation.filename)}</span>
                            <span className="font-medium text-gray-700">{citation.filename}</span>
                            <span className="text-gray-500">(Chunk {citation.chunkIndex})</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">Relevance: {(parseFloat(citation.relevance) * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{citation.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage; 