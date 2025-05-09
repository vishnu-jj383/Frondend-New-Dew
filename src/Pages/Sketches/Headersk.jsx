import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Add this import
import { FaUserCircle } from 'react-icons/fa';
const Header = () => {
  const sideBarState = useSelector(state => state?.sidebar?.sideBar);
  const navigate = useNavigate(); // Add navigate hook
  
  function logOutFunction() {
    // Remove both cookies on logout
    Cookies.remove("authToken");
    Cookies.remove("username");
    Cookies.remove("user_mail");
   
    
    navigate("/"); // This was missing in your original code
  }

  // Get username from cookie
  const username = Cookies.get("username") ; // Fallback to "User" if no username
  // alert(username)
  const user_mail = Cookies.get("user_mail") ; // Fallback to "User" if no username
 
  return (
    <>
      <div className="main-header">
        <div className="main-header-logo">
          <div className="logo-header" data-background-color="dark">
            <div className="nav-toggle">
              <button className="btn btn-toggle toggle-sidebar">
                <i className="gg-menu-right" />
              </button>
              <button className="btn btn-toggle sidenav-toggler">
                <i className="gg-menu-left" />
              </button>
            </div>
            <button className="topbar-toggler more">
              <i className="gg-more-vertical-alt" />
            </button>
          </div>
        </div>
        <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
          <div className="container-fluid">
            <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
              <li className="nav-item topbar-user dropdown hidden-caret">
                <a
                  className="dropdown-toggle profile-pic"
                  data-bs-toggle="dropdown"
                  href="#"
                  aria-expanded="false"
                >
                  <div className="user-box">
                  <div className="avatar-md">
                    <FaUserCircle size={30} className="avatar-img rounded" />
                  </div>
                </div>
                  <span className="profile-username">
                    <span className="op-7">Hi,</span>
                    <span className="fw-bold">{username}</span> {/* Display username here */}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-user animated fadeIn">
                  <div className="dropdown-user-scroll scrollbar-outer">
                    <li>
                      <div className="user-box">
                        <div className="avatar-lg">
                        <FaUserCircle size={30} className="avatar-img rounded" />
                          {/* <img
                            src="assets/img/profile.jpg"
                            alt="image profile"
                            className="avatar-img rounded"
                          /> */}
                        </div>
                        <div className="u-text">
                          <h4>{username}</h4> {/* Display username here */}
                          <p className="text-muted">{user_mail}</p>
                          
                        </div>
                      </div>
                    </li>
                    <li>
                      
                      
                     
                     
                      <div>&nbsp;</div>
                      <div>&nbsp;</div>
                      <a className="dropdown-item" href="/" onClick={logOutFunction}>
                        Logout
                      </a>
                    </li>
                  </div>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;