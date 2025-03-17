import React from 'react';

const FileUploadPreview = ({ files, onRemove }) => {
  if (!files.length) return null;

  return (
    <div className="mt-3">
      <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h5>
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            {file.type.startsWith('image/') ? (
              // Image preview
              <div className="relative">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name}
                  className="h-20 w-auto object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ) : (
              // Non-image file
              <div className="relative">
                <div className="flex flex-col items-center p-3 bg-gray-100 rounded border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            )}
            <span className="text-xs text-gray-500 mt-1 block truncate max-w-[80px]">
              {file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadPreview; 