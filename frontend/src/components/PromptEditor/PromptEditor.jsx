import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';
import './PromptEditor.css'; // We will create this CSS file next

const PromptEditor = () => {
  const [documentTitle, setDocumentTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit options if needed
        // For example, to disable some default extensions:
        // heading: false,
        // blockquote: false,
        // codeBlock: false,
        // horizontalRule: false,
      }),
    ],
    content: '<p>Start typing your prompt here...</p>',
    editorProps: {
      attributes: {
        class: 'prompt-editor-content',
      },
    },
  });

  return (
    <div className="prompt-editor-container">
      <input
        type="text"
        value={documentTitle}
        onChange={(e) => setDocumentTitle(e.target.value)}
        placeholder="Document title"
        className="prompt-document-title-input"
      />
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default PromptEditor;
