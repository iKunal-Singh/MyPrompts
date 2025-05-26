import React from 'react';
import './AgentCard.css'; // We will create this CSS file next

// Simple placeholder for icons - in a real app, use an icon library
const GearIcon = () => <span className="icon gear-icon">⚙️</span>;
const TrashIcon = () => <span className="icon trash-icon">🗑️</span>;
const AgentLogoPlaceholder = ({ agentType }) => {
  // Simple hash function to get a color based on agentType string
  let hash = 0;
  for (let i = 0; i < agentType.length; i++) {
    hash = agentType.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 80%)`; // Generate a pastel color

  return (
    <div className="agent-logo-placeholder" style={{ backgroundColor: color }}>
      {agentType.substring(0, 1).toUpperCase()} {/* Display first letter */}
    </div>
  );
};


const AgentCard = ({ agent, onEdit, onDelete }) => {
  // Assuming agent object has: _id, agent_type, status
  // The full agent object might have more details, but we display these.
  // The actual API key is not (and should not be) available on the client.

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <AgentLogoPlaceholder agentType={agent.agent_type} />
        <h3 className="agent-card-title">{agent.agent_type}</h3>
      </div>
      <div className="agent-card-body">
        <p className="agent-card-status">
          Status: <span className={`status-${(agent.status || 'unknown').toLowerCase()}`}>{agent.status || 'Unknown'}</span>
        </p>
        {/* Add other details here if needed */}
      </div>
      <div className="agent-card-actions">
        <button onClick={() => onEdit(agent)} className="action-btn edit-btn" aria-label="Edit agent settings">
          <GearIcon /> Settings
        </button>
        <button onClick={() => onDelete(agent._id)} className="action-btn delete-btn" aria-label="Delete agent">
          <TrashIcon /> Delete
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
