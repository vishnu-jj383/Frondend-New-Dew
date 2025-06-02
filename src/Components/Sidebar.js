import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import Cookies from "js-cookie";
import dewicon from "./dew.jpg";
function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate(); // Add navigate hook
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const isActive = (path) => location.pathname === path;

  function logOutFunction() {
    // Remove both cookies on logout
    Cookies.remove("authToken");
    Cookies.remove("username");
    Cookies.remove("user_mail");

    navigate("/login"); // This was missing in your original code
  }
  // Define dropdown data
  const dropdowns = [
    {
      name: "pd",
      label: "PD",
      icon: "🔧",
      items: [
        { path: "/createOrder", label: "Create PD", icon: "➕" },
        { path: "/pdLists", label: "List", icon: "📋" },
        { path: "/approvalLists", label: "Approval List", icon: "🔒" },
      ],
    },
    {
      name: "sketch",
      label: "Sketch",
      icon: "✏️",
      items: [
        { path: "/view_sketch_model", label: "Add Sketch", icon: "➕" },
        { path: "/sketchlist", label: "List", icon: "📋" },
        { path: "/sketch_approvalLists", label: "Approval List", icon: "🔒" },
        { path: "/sketchGridView", label: "Grid View", icon: "🔒" },
      ],
    },
    {
      name: "cad",
      label: "CAD",
      icon: "📐",
      items: [
        { path: "/view_cad_Model", label: "Add CAD", icon: "➕" },
        { path: "/cadlist", label: "List", icon: "📋" },
        { path: "/cad_approval_list", label: "Approval List", icon: "🔒" },
        { path: "/cad_gridview", label: "Grid View", icon: "🔒" },
      ],
    },
    {
      name: "render",
      label: "Render",
      icon: "🎨",
      items: [
        { path: "/render_list", label: "List", icon: "📋" },
        { path: "/renderApproval__list", label: "Approval List", icon: "🔒" },
        { path: "/render_gridview", label: "Render Gridview", icon: "🔒" },
      ],
    },
    {
      name: "design",
      label: "Design",
      icon: "🖌️",
      items: [
        { path: "/designBank", label: "Create Album", icon: "➕" },
        { path: "/list_album", label: "View Album", icon: "📋" },
        { path: "/designMaster", label: "Design Master", icon: "🔒" },
      ],
    },
    {
      name: "report",
      label: "Report",
      icon: "📈",
      items: [
        { path: "/designReports", label: "Design Report", icon: "✍️" },
        { path: "/designerReports", label: "Employee Report", icon: "👥" },
        {
          path: "/delivery_report",
          label: "Design Delivary Report",
          icon: "🚚",
        },
        {
          path: "/working_progress_report",
          label: "Working Progress Report",
          icon: "⏳",
        },
        { path: "/insightReports", label: "Insight Report", icon: "🔍" },
        { path: "/feedbacklist", label: "Feedback", icon: "💬" },
      ],
    },
    {
      name: "album",
      label: "Album",
      icon: "📸",
      items: [{ path: "/dewAlbum", label: "Dew Album", icon: "📋" }],
    },
    {
      name: "customer",
      label: "Customer",
      icon: "👥",
      items: [
        { path: "/create_customer", label: "Add Customer", icon: "➕" },
        { path: "/customer__list", label: "Customer List", icon: "🔒" },
      ],
    },
    {
      name: "employee",
      label: "Employee",
      icon: "💼",
      items: [
        { path: "/list_employe", label: "List", icon: "👤" },
        { path: "/add_employee", label: "Add Employee", icon: "➕" },
        // { path: '/settings/notifications', label: 'Notifications', icon: '🔔' },
        // { path: '/settings/appearance', label: 'Appearance', icon: '🎨' },
        // { path: '/settings/billing', label: 'Billing', icon: '💳' },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h3>
          <div className="icon-container">
            <img alt="Logo" src={dewicon} className="login-image" />
          </div>
          {/* <span className="sidebar-icon">⚙️</span>DEW DIAMONDS */}
        </h3>
        {/* <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <span className="close-icon">✖</span>
        </button> */}
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/" className={isActive("/") ? "active" : ""}>
            <span className="icon">📊</span>
            <span className="text">Dashboard</span>
          </Link>
        </li>

        {dropdowns.map((dropdown) => (
          <li className="dropdown-container" key={dropdown.name}>
            <button
              className={`dropdown-btn ${
                openDropdown === dropdown.name ? "active" : ""
              }`}
              onClick={() => toggleDropdown(dropdown.name)}
            >
              <span>
                <span className="icon">{dropdown.icon}</span>
                <span className="text">{dropdown.label}</span>
              </span>
              <span className="dropdown-icon">
                {openDropdown === dropdown.name ? "▾" : "▸"}
              </span>
            </button>
            <div
              className={`dropdown-content ${
                openDropdown === dropdown.name ? "show" : ""
              }`}
            >
              {dropdown.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={isActive(item.path) ? "active" : ""}
                >
                  <span className="sub-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </li>
        ))}

        <li>
          <Link
            onClick={logOutFunction}
            className={isActive("/logout") ? "active" : ""}
          >
            <span className="icon">⬅️</span>
            <span className="text">Logout</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
