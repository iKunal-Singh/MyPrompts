import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faPlay } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar';
import MetadataPanel from './MetadataPanel';
import AgentExecutionPanel from './AgentExecutionPanel';
import CollapsibleToggleNode from '../TiptapExtensions/CollapsibleToggle/CollapsibleToggleNode'; // Step 1.1
import '../TiptapExtensions/CollapsibleToggle/CollapsibleToggle.css'; // Step 1.2
import './PromptEditor.css';

const PromptEditor = () => {
  const { promptId: urlPromptId } = useParams();
  const [promptId, setPromptId] = useState(urlPromptId);
  const [documentTitle, setDocumentTitle] = useState('');
  const [activeTab, setActiveTab] = useState('metadata');
  const [currentVariables, setCurrentVariables] = useState({});

  useEffect(() => {
    if (urlPromptId) {
      setPromptId(urlPromptId);
    } else {
      setPromptId(null);
    }
  }, [urlPromptId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit options if needed
      }),
      CollapsibleToggleNode, // Step 1.3
    ],
    content: `
      <h2>Welcome to the Enhanced Prompt Editor!</h2>
      <p>This editor now supports code blocks, inline code, and collapsible toggles.</p>
      <collapsible-toggle isOpen="true">
        <p>Summary for the first toggle...</p>
        <p>Content inside the first toggle. This one starts open!</p>
        <pre><code>console.log("Hello Toggle!");</code></pre>
      </collapsible-toggle>
      <p><code>Inline code</code> example outside toggle.</p>
      <pre><code>function greet() {\n  return "Hello World";\n}</code></pre>
      <collapsible-toggle>
        <p>Summary for the second toggle (starts closed).</p>
        <p>Content inside the second toggle.</p>
        <ul><li>List Item 1</li><li>List Item 2</li></ul>
      </collapsible-toggle>
    `,
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
      <div className="prompt-editor-side-column">
        <div className="tabs-container">
          <button 
            onClick={() => setActiveTab('metadata')} 
            className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faTags} /> Metadata
          </button>
          <button 
            onClick={() => setActiveTab('execute')} 
            className={`tab-button ${activeTab === 'execute' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faPlay} /> Execute
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'metadata' && <MetadataPanel />}
          {activeTab === 'execute' && editor && (
            <AgentExecutionPanel
              editor={editor}
              promptId={promptId} // Pass the actual promptId
              currentVariables={currentVariables} // Pass currentVariables state
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
