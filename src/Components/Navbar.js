import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Navbar.css";

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button 
          className="menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <div className={`hamburger ${isSidebarOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className="nav-right">
          <Link to="/" className="nav-title">
            <span className="nav-icon">⚡</span>
            MyApp
          </Link>

          <div className="nav-menu" style={{marginLeft:"750px"}}>
            <div className="menu-icons">
              <div className="menu-item">
                <button 
                  className="icon-btn"
                  onClick={() => toggleMenu('profile')}
                  aria-label="Profile"
                >
                  👤
                </button>
                {activeMenu === 'profile' && (
                  <div className="dropdown-item">
                    <Link to="/profile" onClick={() => setActiveMenu(null)}>Profile</Link>
                  </div>
                )}
              </div>

              <div className="menu-item">
                <button 
                  className="icon-btn"
                  onClick={() => toggleMenu('settings')}
                  aria-label="Settings"
                >
                  ⚙️
                </button>
                {activeMenu === 'settings' && (
                  <div className="dropdown-item">
                    <Link to="/settings" onClick={() => setActiveMenu(null)}>Settings</Link>
                  </div>
                )}
              </div>

              <div className="menu-item">
                <button 
                  className="icon-btn"
                  onClick={() => toggleMenu('logout')}
                  aria-label="Logout"
                >
                  🚪
                </button>
                {activeMenu === 'logout' && (
                  <div className="dropdown-item">
                    <Link to="/logout" onClick={() => setActiveMenu(null)}>Logout</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;