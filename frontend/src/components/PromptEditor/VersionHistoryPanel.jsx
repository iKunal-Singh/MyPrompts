import React, { useState, useEffect } from 'react';
import { getPromptVersions, revertToVersion } from '../../services/promptService';
import './VersionHistoryPanel.css';

const VersionHistoryPanel = ({ currentPromptId, onVersionReverted, onPreviewVersion }) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentPromptId) {
      setIsLoading(true);
      setError(null);
      getPromptVersions(currentPromptId)
        .then(data => {
          setVersions(data || []); // Ensure data is an array
        })
        .catch(err => {
          console.error("Error fetching versions:", err);
          setError(err.message || 'Failed to fetch versions.');
          setVersions([]); // Clear versions on error
        })
        .finally(() => setIsLoading(false));
    } else {
      setVersions([]); // Clear versions if no prompt ID
    }
  }, [currentPromptId]);

  const handleRevert = async (versionNumber) => {
    if (!currentPromptId || !versionNumber) return;
    if (!window.confirm(`Are you sure you want to revert to version ${versionNumber}? This will create a new version from the current state before reverting.`)) {
      return;
    }
    try {
      const revertedPrompt = await revertToVersion(currentPromptId, versionNumber);
      alert(`Successfully reverted to version ${versionNumber}. The main prompt is now updated.`);
      onVersionReverted(revertedPrompt); // Notify parent to update its state
      // Re-fetch versions as revert might create a new one from current state
      if (currentPromptId) {
        getPromptVersions(currentPromptId).then(setVersions).catch(err => console.error("Error re-fetching versions:", err));
      }
    } catch (err) {
      console.error("Error reverting version:", err);
      alert(`Failed to revert: ${err.message}`);
    }
  };
  
  const handlePreview = (version) => {
    if(onPreviewVersion) {
      onPreviewVersion(version); // Pass the whole version object up
    }
  };

  if (!currentPromptId) {
    return (
      <aside className="version-history-panel">
        <h4 className="version-history-title">Version History</h4>
        <p>Save the prompt to enable version history.</p>
      </aside>
    );
  }
  
  if (isLoading) return <div className="version-history-panel"><p>Loading versions...</p></div>;
  if (error) return <div className="version-history-panel"><p style={{color: 'red'}}>Error: {error}</p></div>;

  return (
    <aside className="version-history-panel">
      <h4 className="version-history-title">Version History</h4>
      {versions.length === 0 ? (
        <p>No past versions found for this prompt.</p>
      ) : (
        <ul className="version-list">
          {versions.map((version) => (
            <li key={version.version_number} className="version-item">
              <div className="version-info">
                <strong>Version {version.version_number}</strong>
                <span className="version-date">
                  Saved: {new Date(version.created_at).toLocaleString()}
                </span>
              </div>
              <div className="version-actions">
                <button onClick={() => handlePreview(version)} className="version-action-btn preview-btn">
                  Preview
                </button>
                <button onClick={() => handleRevert(version.version_number)} className="version-action-btn revert-btn">
                  Revert to this
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default VersionHistoryPanel;
