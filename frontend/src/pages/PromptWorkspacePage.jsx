import React from 'react';
import PromptEditor from '../components/PromptEditor/PromptEditor';

const PromptWorkspacePage = () => {
  return (
    <div>
      {/* 
        You could add other workspace-specific elements here, 
        like a header for the workspace, or side panels, etc.
        For now, it just renders the PromptEditor.
      */}
      <PromptEditor />
    </div>
  );
};

export default PromptWorkspacePage;
