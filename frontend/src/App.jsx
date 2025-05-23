import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import MyProjectsPage from './pages/MyProjectsPage';
import AgentsPage from './pages/AgentsPage';
import TagsPage from './pages/TagsPage';
import SettingsPage from './pages/SettingsPage';
import ExplorePage from './pages/ExplorePage';
import PromptWorkspacePage from './pages/PromptWorkspacePage'; // Import the new page
import './App.css'; // General app styles, if any (Vite might use index.css or App.css)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default route to My Projects */}
          <Route index element={<Navigate replace to="/projects" />} /> 
          <Route path="projects" element={<MyProjectsPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="prompt-editor" element={<PromptWorkspacePage />} /> {/* Add new route */}
          {/* You can add a 404 Not Found page here later */}
          <Route path="*" element={<Navigate replace to="/projects" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
