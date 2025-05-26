import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';
import MetadataPanel from './MetadataPanel'; // Import the new panel
import './PromptEditor.css';

const PromptEditor = () => {
  const [documentTitle, setDocumentTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit options if needed
      }),
    ],
    content: '<p>Start typing your prompt here...</p>',
    editorProps: {
      attributes: {
        class: 'prompt-editor-content-area', // Changed class for clarity
      },
    },
  });

  return (
    <div className="prompt-editor-layout"> {/* Main layout container */}
      <div className="prompt-editor-main-column"> {/* Left column for title and editor */}
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Document title"
          className="prompt-document-title-input"
        />
        <div className="tiptap-editor-wrapper"> {/* Wrapper for menu and content */}
          {editor && <MenuBar editor={editor} />}
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="prompt-editor-side-column"> {/* Right column for metadata */}
        <MetadataPanel />
      </div>
    </div>
  );
};

export default PromptEditor;
