import React, { useState, useEffect, useCallback } from 'react';
import AgentCard from '../components/AgentCard/AgentCard';
import AddAgentModal from '../components/Modals/AddAgentModal';
import { getUserAgentConfigs, createOrUpdateAgentConfig, deleteAgentConfig } from '../services/agentService';
import './AgentsPage.css'; // Styles for the page layout

const PlusIcon = () => <span className="icon plus-icon" style={{fontSize: '1.2em', marginRight: '4px'}}>+</span>;


const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null); // For editing existing agent

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAgents = await getUserAgentConfigs();
      setAgents(fetchedAgents || []); // Ensure agents is always an array
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError(err.message || 'Failed to fetch agents.');
      setAgents([]); // Clear agents on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleOpenModal = (agent = null) => {
    setEditingAgent(agent); // If agent is provided, it's for editing
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null); // Clear editing state
  };

  const handleSaveAgent = async (agentData) => {
    // Note: The backend's createOrUpdateUserAgentConfig handles both create and update (upsert)
    // It identifies existing configs by (userId, agent_type).
    // If `editingAgent` exists, its `_id` isn't directly used for the upsert query,
    // but the `agent_type` will match, leading to an update.
    try {
      await createOrUpdateAgentConfig(agentData);
      fetchAgents(); // Refresh the list
      handleCloseModal();
      alert(`Agent configuration for ${agentData.agent_type} saved successfully!`);
    } catch (err) {
      console.error("Error saving agent:", err);
      alert(`Failed to save agent: ${err.message}`);
      // Optionally, keep modal open and display error within modal if preferred
    }
  };

  const handleDeleteAgent = async (configId) => {
    if (window.confirm('Are you sure you want to delete this agent configuration?')) {
      try {
        await deleteAgentConfig(configId);
        fetchAgents(); // Refresh the list
        alert('Agent configuration deleted successfully!');
      } catch (err) {
        console.error("Error deleting agent:", err);
        alert(`Failed to delete agent: ${err.message}`);
      }
    }
  };
  
  if (isLoading) {
    return <div className="content-card"><p>Loading agent configurations...</p></div>;
  }

  if (error) {
    return <div className="content-card" style={{color: 'red'}}><p>Error loading agents: {error}</p></div>;
  }

  return (
    <div className="content-card agents-page-container">
      <div className="agents-page-header">
        <h2>AI Agent Configurations</h2>
        <button onClick={() => handleOpenModal()} className="add-agent-btn">
          <PlusIcon /> Add New Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <p className="no-agents-message">No agent configurations found. Click 'Add New Agent' to get started.</p>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id} // Assuming _id is unique and present
              agent={agent}
              onEdit={() => handleOpenModal(agent)} // Pass agent data for editing
              onDelete={handleDeleteAgent}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddAgentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAgent}
          existingAgentConfig={editingAgent} // Pass agent data if editing
        />
      )}
    </div>
  );
};

export default AgentsPage;
