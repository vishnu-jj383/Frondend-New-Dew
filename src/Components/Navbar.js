import React, { useState } from 'react';
import { Link, useLocation ,useNavigate} from 'react-router-dom';
import './Navbar.css';
import Cookies from 'js-cookie';
import Swal from "sweetalert2";

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

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logOutFunction();
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been logged out successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };
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
        className="icon-btn flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
        onClick={handleLogoutClick}
        aria-label="Logout"
      >
        ⬅️ 
      </button>
    </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;