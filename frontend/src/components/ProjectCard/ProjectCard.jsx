import React from 'react';
import './ProjectCard.css'; // We will create this CSS file next

const ProjectCard = ({ project }) => {
  const { title, description, typeTag, promptCount, lastUpdated } = project;

  // A simple function to determine tag color based on type (can be expanded)
  const getTagStyle = (tag) => {
    let backgroundColor;
    switch (tag.toLowerCase()) {
      case 'chatbot':
        backgroundColor = 'var(--accent-lavender)'; // #E6E6FA
        break;
      case 'content gen':
        backgroundColor = 'var(--accent-sky-blue)'; // #ADD8E6
        break;
      case 'image ai':
        backgroundColor = 'var(--accent-soft-green)'; // #90EE90
        break;
      default:
        backgroundColor = '#E0E0E0'; // A default grey
    }
    return { backgroundColor };
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-card-title">{title}</h3>
        <span className="project-card-tag" style={getTagStyle(typeTag)}>
          {typeTag}
        </span>
      </div>
      <p className="project-card-description">{description}</p>
      <div className="project-card-footer">
        <span className="project-card-prompts">{promptCount} Prompts</span>
        <span className="project-card-updated">{lastUpdated}</span>
      </div>
    </div>
  );
};

export default ProjectCard;
