import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import MyProjectsPage from './pages/MyProjectsPage';
import AgentsPage from './pages/AgentsPage';
import TagsPage from './pages/TagsPage';
import SettingsPage from './pages/SettingsPage';
import ExplorePage from './pages/ExplorePage';
import PromptWorkspacePage from './pages/PromptWorkspacePage';
import PromptComparisonPage from './pages/PromptComparisonPage'; // Import the new page
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate replace to="/projects" />} /> 
          <Route path="projects" element={<MyProjectsPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="prompt-editor" element={<PromptWorkspacePage />} />
          <Route path="compare/:promptId1/:promptId2" element={<PromptComparisonPage />} /> {/* New comparison route */}
          <Route path="*" element={<Navigate replace to="/projects" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
