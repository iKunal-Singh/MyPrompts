import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react'; // EditorContent and MenuBar are imported where used
import StarterKit from '@tiptap/starter-kit';
import MenuBar from '../components/PromptEditor/MenuBar';
import MetadataPanel from '../components/PromptEditor/MetadataPanel';
import VersionHistoryPanel from '../components/PromptEditor/VersionHistoryPanel'; // Import VersionHistoryPanel
import { createPrompt, getPrompt, updatePrompt, getPromptVersions, revertToVersion } from '../services/promptService'; // Updated imports
import '../components/PromptEditor/PromptEditor.css'; // Main CSS for editor layout

// Direct import for EditorContent as it's part of the JSX
import { EditorContent } from '@tiptap/react';


const PromptWorkspacePage = () => {
  const [promptId, setPromptId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  
  const [metadata, setMetadata] = useState({
    tags: [], 
    model_used: 'GPT-4',
    output_type: 'Text',
    purpose_use_case: '',
    parameters_used: '',
    variables_placeholders: [],
    expected_output_format_structure: '',
    source_reference: '',
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing your prompt here...</p>',
    editorProps: {
      attributes: {
        class: 'prompt-editor-content-area',
      },
    },
  });

  const populateEditorState = useCallback((promptData) => {
    if (!promptData) return;
    setPromptId(promptData._id || null);
    setDocumentTitle(promptData.title || '');
    if (editor && promptData.content) {
      editor.commands.setContent(promptData.content);
    }
    if (promptData.metadata && typeof promptData.metadata === 'object') {
      setMetadata({
        tags: promptData.metadata.tags || [],
        model_used: promptData.metadata.model_used || 'GPT-4',
        output_type: promptData.metadata.output_type || 'Text',
        purpose_use_case: promptData.metadata.purpose_use_case || '',
        parameters_used: promptData.metadata.parameters_used || '',
        variables_placeholders: promptData.metadata.variables_placeholders || [],
        expected_output_format_structure: promptData.metadata.expected_output_format_structure || '',
        source_reference: promptData.metadata.source_reference || '',
      });
    } else {
      setMetadata({ // Reset to default if no metadata
        tags: [], model_used: 'GPT-4', output_type: 'Text', purpose_use_case: '',
        parameters_used: '', variables_placeholders: [], expected_output_format_structure: '', source_reference: '',
      });
    }
  }, [editor]);

  // Load functionality (for testing) - replace with actual prompt ID
  useEffect(() => {
    // const testPromptIdToLoad = "YOUR_TEST_PROMPT_ID_HERE"; // Example: "666102d672c1de493c930412"
    const testPromptIdToLoad = null; // Set to an ID to test loading
    if (testPromptIdToLoad && editor) {
      getPrompt(testPromptIdToLoad)
        .then(promptData => {
          if (promptData) {
            populateEditorState(promptData);
          }
        })
        .catch(err => console.error("Error loading prompt:", err));
    }
  }, [editor, populateEditorState]);

  const handleSavePrompt = async () => {
    if (!editor) return;

    // Ensure this projectId exists in your 'projects' collection.
    // The hardcoded `x-user-id`="123" from API Gateway is used by backend.
    // This ID "123" is NOT a valid ObjectId and will cause errors in backend if not handled.
    // For successful save, User and Project services need to be running, and a valid ProjectId for an existing project.
    const testProjectId = "6660ff7072c1de493c93040e"; // Replace with a REAL ObjectId from your Project collection
                                                    // Or ensure your backend can handle non-ObjectId strings if that's the temporary design.
                                                    // Based on current backend setup, it expects valid ObjectId strings.

    const promptDataPayload = {
      title: documentTitle,
      content: editor.getHTML(), 
      projectId: testProjectId, 
      metadata: {
        ...metadata,
        // Ensure tags and variables are arrays, converting from string if needed (e.g. if they were simple input fields)
        // MetadataPanel already manages them as arrays/strings as per its own state logic.
      }
    };

    try {
      let savedPrompt;
      if (promptId) {
        savedPrompt = await updatePrompt(promptId, promptDataPayload);
        alert('Prompt updated successfully!');
      } else {
        savedPrompt = await createPrompt(promptDataPayload);
        alert('Prompt saved successfully!');
      }
      
      if (savedPrompt) {
        populateEditorState(savedPrompt); // Update state with backend response (e.g., _id, timestamps)
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert(`Error saving prompt: ${error.message}`);
    }
  };
  
  const handleMetadataChange = (newMetadataValues) => {
    setMetadata(prev => ({ ...prev, ...newMetadataValues }));
  };

  const handlePreviewVersion = (versionData) => {
    // Populate editor and metadata panel with version data for preview
    // This doesn't change promptId, so saving will still update the main prompt
    if (!editor) return;
    editor.commands.setContent(versionData.content || ''); // Set editor content
    setDocumentTitle(versionData.title || ''); // Update document title
    
    // Update metadata state. Ensure all fields are covered.
    const currentVersionMetadata = versionData.metadata || {};
    setMetadata({
        tags: currentVersionMetadata.tags || [],
        model_used: currentVersionMetadata.model_used || 'GPT-4',
        output_type: currentVersionMetadata.output_type || 'Text',
        purpose_use_case: currentVersionMetadata.purpose_use_case || '',
        parameters_used: currentVersionMetadata.parameters_used || '',
        variables_placeholders: currentVersionMetadata.variables_placeholders || [],
        expected_output_format_structure: currentVersionMetadata.expected_output_format_structure || '',
        source_reference: currentVersionMetadata.source_reference || '',
    });
    alert(`Previewing Version ${versionData.version_number}. Current unsaved changes are temporarily displayed. Save to make this version permanent (which will create a new version).`);
  };

  const handleVersionReverted = (revertedPromptData) => {
    // After successful revert, backend returns the updated main prompt.
    // Repopulate the editor with this data.
    populateEditorState(revertedPromptData);
    // The VersionHistoryPanel will re-fetch its versions.
  };

  return (
    <div className="prompt-editor-layout">
      <div className="prompt-editor-main-column">
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Document title"
          className="prompt-document-title-input"
        />
        <div className="tiptap-editor-wrapper">
          {editor && <MenuBar editor={editor} />}
          <EditorContent editor={editor} />
        </div>
        <button onClick={handleSavePrompt} className="prompt-save-button">
          {promptId ? 'Update Prompt' : 'Save Prompt'}
        </button>
      </div>
      <div className="prompt-editor-side-column">
        <MetadataPanel initialMetadata={metadata} onMetadataChange={handleMetadataChange} />
        {/* Version History Panel, only shown if a prompt is loaded/saved */}
        {promptId && (
          <VersionHistoryPanel
            currentPromptId={promptId}
            onVersionReverted={handleVersionReverted}
            onPreviewVersion={handlePreviewVersion}
          />
        )}
      </div>
    </div>
  );
};

export default PromptWorkspacePage;
