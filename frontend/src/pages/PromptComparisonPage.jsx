import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { getPromptById } from '../services/promptService'; // Will be used later
import './PromptComparisonPage.css';

const PromptComparisonPage = () => {
  const { promptId1, promptId2 } = useParams(); // Step 1: Get IDs from URL

  const [prompt1Data, setPrompt1Data] = useState(null);
  const [prompt2Data, setPrompt2Data] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 3: Fetching Prompt Data (Mocked Initially)
  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      setError('');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // In a real scenario, you'd fetch actual data:
        // const data1 = await getPromptById(promptId1);
        // const data2 = await getPromptById(promptId2);
        // setPrompt1Data(data1.prompt);
        // setPrompt2Data(data2.prompt);

        const placeholderPrompt1 = {
          id: promptId1 || 'prompt1',
          title: `Prompt ${promptId1 || 'A'} - Version 1`,
          content: `<p>This is the content of Prompt ${promptId1 || 'A'}, version 1. It focuses on generating creative story ideas, exploring vast galaxies and ancient mysteries.</p><ul><li>Point 1</li><li>Point 2</li></ul>`,
          parameters: { temperature: 0.7, model: 'gpt-4', max_tokens: 500 },
          mockOutput: `Output for Prompt ${promptId1 || 'A'}, v1: A thrilling space opera adventure where a rogue archaeologist discovers an ancient artifact that could unravel the secrets of the universe, pursued by a relentless intergalactic empire.`
        };
        const placeholderPrompt2 = {
          id: promptId2 || 'prompt2',
          title: `Prompt ${promptId2 || 'B'} - Version 1`, // Assuming different prompts or versions
          content: `<p>This is the content of Prompt ${promptId2 || 'B'}, version 1. It is a revised version, aiming for more concise and impactful marketing copy for a new tech gadget.</p><p>Focus on benefits, not just features.</p>`,
          parameters: { temperature: 0.5, model: 'gpt-4-turbo', max_tokens: 256 },
          mockOutput: `Output for Prompt ${promptId2 || 'B'}, v1: Unlock unparalleled productivity with the new NovaWidget! Seamlessly integrate your digital life and experience blazing-fast performance. Order yours today!`
        };
        
        setPrompt1Data(placeholderPrompt1);
        setPrompt2Data(placeholderPrompt2);

      } catch (err) {
        console.error("Error fetching prompt data:", err);
        setError(`Failed to load prompts. ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [promptId1, promptId2]);

  // Step 4 & 5: Layout and Display (Basic structure)
  if (isLoading) {
    return <div className="loading-message">Loading prompt comparison...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!prompt1Data || !prompt2Data) {
    return <div className="loading-message">Prompt data not available.</div>;
  }
  
  const renderPromptColumn = (prompt) => {
    if (!prompt) return null;
    return (
      <div className="prompt-column">
        <h2>{prompt.title}</h2>
        <div className="prompt-section parameters-section">
          <h3>Parameters</h3>
          <ul>
            {Object.entries(prompt.parameters).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {String(value)}</li>
            ))}
          </ul>
        </div>
        <div className="prompt-section content-section">
          <h3>Content</h3>
          <div dangerouslySetInnerHTML={{ __html: prompt.content }} className="prompt-content-display"/>
        </div>
        <div className="prompt-section output-section">
          <h3>Mock Output</h3>
          <div className="prompt-output-display">{prompt.mockOutput}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="prompt-comparison-page">
      <header className="comparison-header">
        <h1>Prompt Comparison View</h1>
      </header>
      <div className="comparison-actions-top">
        <button onClick={() => console.log('Select Best clicked')}>Select Best</button>
        <button onClick={() => console.log('Export clicked')}>Export</button>
        <button onClick={() => console.log('Duplicate clicked')}>Duplicate</button>
      </div>
      <div className="comparison-container">
        {renderPromptColumn(prompt1Data)}
        {renderPromptColumn(prompt2Data)}
      </div>
    </div>
  );
};

export default PromptComparisonPage;
