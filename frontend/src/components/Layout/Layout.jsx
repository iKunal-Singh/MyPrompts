import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css'; // We will create this CSS file next

const Layout = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/">My Projects</Link></li>
            <li><Link to="/agents">Agents</Link></li>
            <li><Link to="/tags">Tags</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><Link to="/explore">Explore</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default Layout;
