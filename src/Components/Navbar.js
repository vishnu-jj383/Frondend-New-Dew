import React, { useState } from 'react';
import { Link, useLocation ,useNavigate} from 'react-router-dom';
import './Navbar.css';
import Cookies from 'js-cookie';

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
const navigate = useNavigate(); // Add navigate hook
  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

const username = Cookies.get('username') || 'User';
function logOutFunction() {
    // Remove both cookies on logout
    Cookies.remove("authToken");
    Cookies.remove("username");
    Cookies.remove("user_mail");
   
    
    navigate("/login"); // This was missing in your original code
  }
  return (
    <nav className="navbar">
      <div className="nav-left">
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
        <Link to="/" className="nav-title">
          <span className="nav-icon">⚡</span>
          Hi, {username}
        </Link>
      </div>
      <button
        className="menu-btn mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
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
                <Link to="/profile" onClick={() => setActiveMenu(null)}>
                  Profile
                </Link>
              </div>
            )}
          </div>
          <div className="menu-item">
            <button
              className="icon-btn"
              onClick={() => toggleMenu('logout')}
              aria-label="Logout"
            >
              ⬅️
            </button>
            {activeMenu === 'logout' && (
              <div className="dropdown-item">
                <Link  onClick={logOutFunction}>
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;