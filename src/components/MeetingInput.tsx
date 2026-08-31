'use client';

import { useState, useRef } from 'react';

interface MeetingInputProps {
  onProcess: (transcript: string) => void;
  isLoading: boolean;
}

export default function MeetingInput({ onProcess, isLoading }: MeetingInputProps) {
  const [transcript, setTranscript] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (transcript.trim()) {
      onProcess(transcript);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTranscript(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const EXAMPLE_TRANSCRIPT = `Team Sync - August 30, 2026

Sarah: The login page is still showing errors for some users. I think we need to look into the authentication flow.

Mike: I can take a look at the backend logs. Also, we should update the API documentation since we changed the endpoints last week.

Alex: The client wants a demo of the new features by Friday. We need to prepare a presentation.

Priya: I'll work on the database optimization. It's taking too long to load the dashboard.

Sarah: Good. Mike, can you also review the PR from John? He fixed the navigation bug.

Mike: Sure, I'll do that today.

Alex: We also need to send the weekly status report to the stakeholders.`;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here, or drag and drop a .txt file..."
            className="w-full min-h-[250px] p-4 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed"
            style={{ 
              color: '#1a1a1a',
              backgroundColor: '#ffffff',
            }}
            disabled={isLoading}
          />
          
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                📎 Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setTranscript(EXAMPLE_TRANSCRIPT)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                📋 Use Example
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {transcript.length} characters
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setTranscript('')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading || !transcript}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !transcript.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              '🚀 Extract Action Items'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}