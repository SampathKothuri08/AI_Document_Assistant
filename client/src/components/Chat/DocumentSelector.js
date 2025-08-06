import React, { useState } from 'react';

const DocumentSelector = ({ documents, selectedDocuments, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentToggle = (documentId) => {
    const newSelection = selectedDocuments.includes(documentId)
      ? selectedDocuments.filter(id => id !== documentId)
      : [...selectedDocuments, documentId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = documents.map(doc => doc.id);
    onSelectionChange(allIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
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

  if (documents.length === 0) {
    return (
      <div className="relative">
        <button
          disabled
          className="btn-secondary text-sm opacity-50 cursor-not-allowed"
        >
          No documents
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary text-sm flex items-center space-x-1"
      >
        <span>Documents</span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {selectedDocuments.length === 0 ? 'All' : selectedDocuments.length}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Select Documents</h3>
              <div className="flex space-x-1">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {documents.map((document) => (
              <label
                key={document.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === 0 || selectedDocuments.includes(document.id)}
                  onChange={() => handleDocumentToggle(document.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(document.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {document.fileType.toUpperCase()} • {document.totalChunks} chunks
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {selectedDocuments.length === 0 
                ? 'Searching in all documents' 
                : `Searching in ${selectedDocuments.length} selected document${selectedDocuments.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DocumentSelector; 