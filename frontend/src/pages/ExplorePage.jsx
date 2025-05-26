import React, { useState } from 'react';
import ContentCard from '../components/Explore/ContentCard';
import './ExplorePage.css';

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder data for sections (expanded for variety)
  const recommendedLibraries = [
    { id: 'rl1', title: "Awesome Prompts Repo", description: "A GitHub repository with a vast collection of curated prompts for various tasks. Great for inspiration!", buttonText: "Explore on GitHub", type: "library" },
    { id: 'rl2', title: "Prompt Engineering Guide", description: "Comprehensive guide to prompt engineering techniques and principles. A must-read for all levels.", buttonText: "Learn More", type: "documentation", imageUrl: "/placeholder-doc-guide.png" },
    { id: 'rl3', title: "LangChain Hub", description: "Discover and share LangChain prompts, chains, and agents. For more advanced use cases.", buttonText: "Visit Hub", type: "library" },
  ];

  const bestPractices = [
    { id: 'bp1', title: "Be Specific and Clear", description: "Clearly define the task, context, and desired output format in your prompt for better results.", buttonText: "Read Guide", type: "documentation" },
    { id: 'bp2', title: "Iterative Refinement", description: "Start simple and iteratively add complexity, constraints, and examples to your prompts.", buttonText: "See Examples", type: "documentation" },
    { id: 'bp3', title: "Few-Shot Learning", description: "Provide a few examples (shots) of the desired input-output pairs within the prompt to guide the model.", buttonText: "Understand Technique", type: "documentation" },
  ];
  
  const officialDocs = [
    { id: 'doc1', title: "OpenAI API Documentation", description: "Official documentation for OpenAI models (GPT-4, DALL-E) and API usage.", buttonText: "View Docs", type: "documentation", imageUrl: "/placeholder-doc-openai.png" },
    { id: 'doc2', title: "Anthropic API Docs", description: "Developer resources and documentation for integrating with Claude models.", buttonText: "View Docs", type: "documentation", imageUrl: "/placeholder-doc-anthropic.png" },
    { id: 'doc3', title: "Google AI Gemini API", description: "Learn how to use Google's Gemini models for your multimodal applications.", buttonText: "View Docs", type: "documentation", imageUrl: "/placeholder-doc-google.png" },
  ];

  const featuredTemplates = [
    { id: 'ft1', title: "Email Subject Line Generator", description: "Generate catchy and effective email subject lines for marketing campaigns.", buttonText: "View Template", type: "template", imageUrl: "/placeholder-template-email.png" },
    { id:<i>`</i>ft2', title: "Code Explainer", description: "Explain complex code snippets in simple, easy-to-understand terms. Supports multiple languages.", buttonText: "Use Template", type: "template", imageUrl: "/placeholder-template-code.png" },
    { id: 'ft3', title: "Creative Story Starter", description: "Get a unique and inspiring starting point for your next creative writing piece or novel.", buttonText: "Try Template", type: "template", imageUrl: "/placeholder-template-story.png" },
  ];

  const communityFavorites = [
    { id: 'cf1', title: "Twitter Thread Generator", description: "Create engaging and coherent Twitter threads from a single topic or idea. Auto-numbering included.", buttonText: "View Prompt", type: "template" },
    { id: 'cf2', title: "Recipe Creator from Ingredients", description: "Generate interesting recipe ideas based on a list of ingredients you have on hand.", buttonText: "View Prompt", type: "template", imageUrl: "/placeholder-template-recipe.png"},
    { id: 'cf3', title: "Text Summarizer (ELI5)", description: "Summarize long and complex texts in a way a 5-year-old would understand. Great for learning!", buttonText: "View Prompt", type: "template" },
  ];

  const trendingPrompts = [
    { id: 'tp1', title: "AI Image Generation for Beginners", description: "A simple and effective prompt to get started with DALL-E, Midjourney, or Stable Diffusion.", buttonText: "Try Now", type: "template", imageUrl: "/placeholder-trending-image.png" },
    { id: 'tp2', title: "Generate Product Descriptions", description: "Create compelling and SEO-friendly product descriptions for e-commerce websites.", buttonText: "Try Now", type: "template" },
    { id: 'tp3', title: "Explain a Concept Simply", description: "A versatile prompt to explain any complex topic in an easy-to-understand manner for any audience.", buttonText: "Try Now", type: "template" },
  ];

  // Helper function to render a section with its cards
  const renderSection = (title, items, sectionId) => (
    <section className="explore-section" aria-labelledby={sectionId}>
      <h2 id={sectionId}>{title}</h2>
      <div className="cards-grid">
        {items.map(item => (
          <ContentCard 
            key={item.id}
            title={item.title}
            description={item.description}
            buttonText={item.buttonText}
            imageUrl={item.imageUrl}
            type={item.type}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="explore-page">
      <header className="explore-header">
        <h1>Explore & Discover</h1>
        <p className="explore-subtitle">Find new prompt templates, libraries, and best practices from the community and official sources.</p>
        <div className="search-bar-container">
          <input
            type="search" // Changed to type="search" for semantic meaning
            placeholder="Search for prompts, templates, documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="explore-search-bar"
            aria-label="Search explore content"
          />
          {/* Search button can be added here if desired */}
        </div>
      </header>

      <main className="explore-content">
        {renderSection("Featured Prompt Templates", featuredTemplates, "featured-templates")}
        {renderSection("Trending Prompts", trendingPrompts, "trending-prompts")}
        {renderSection("Community Favorites", communityFavorites, "community-favorites")}
        {renderSection("Recommended Prompt Libraries", recommendedLibraries, "recommended-libraries")}
        {renderSection("Prompt Engineering Best Practices", bestPractices, "best-practices")}
        {renderSection("Official Documentation", officialDocs, "official-docs")}
      </main>
      
    </div>
  );
};

export default ExplorePage;
