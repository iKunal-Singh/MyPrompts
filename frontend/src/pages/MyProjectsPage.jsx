import React from 'react';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import './MyProjectsPage.css'; // Styles for the page layout

const MyProjectsPage = () => {
  const staticProjects = [
    {
      id: 1,
      title: 'Project Alpha',
      description: 'Developing a new chatbot for customer service to handle frequently asked questions and improve user engagement.',
      typeTag: 'Chatbot',
      promptCount: 12,
      lastUpdated: 'Updated 2 days ago',
    },
    {
      id: 2,
      title: 'Project Beta',
      description: 'An AI-powered content generation tool designed to assist marketers in creating engaging blog posts and social media updates.',
      typeTag: 'Content Gen',
      promptCount: 5,
      lastUpdated: 'Updated 5 days ago',
    },
    {
      id: 3,
      title: 'Project Gamma',
      description: 'Exploring various image generation models to create unique visuals for digital art projects and marketing campaigns.',
      typeTag: 'Image AI',
      promptCount: 23,
      lastUpdated: 'Updated 1 week ago',
    },
    {
      id: 4,
      title: 'Delta Assistant',
      description: 'A personal assistant application using natural language processing to manage schedules, reminders, and notes efficiently.',
      typeTag: 'Chatbot',
      promptCount: 8,
      lastUpdated: 'Updated 3 days ago',
    },
  ];

  return (
    <div className="my-projects-page">
      <h2>My Projects</h2> {/* Page Title */}
      <div className="projects-grid">
        {staticProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default MyProjectsPage;
