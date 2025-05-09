import React, { useEffect,useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './App.css';
import "./Table-Textbox-style.css"

import Cookies from "js-cookie";

import Login from './Pages/Accounts/login';

import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Home from './Pages/Home';
import About from './Pages/About';
import EmployeeList from './Pages/Employees/EmployeeList';
import AddEmployee from './Pages/Employees/AddEmployee';
import DashBoard from './Pages/Dashboard/DashBoard';

import ApprovalLists from './Pages/PD-Order/ApprovalLists';
import PdLists from './Pages/PD-Order/PdLists';
import CreatePdOrder from './Pages/PD-Order/CreatePdOrder';
import EditPd from './Pages/PD-Order/EditPd';
import Vieworder from './Pages/PD-Order/Vieworder';

import SketchList from './Pages/Sketches/SketchList';
import SketchApprovalList from './Pages/Sketches/ApprovalLists';
import Add_Sketch from './Pages/Sketches/NewSketch/Add_Sketch';
import EditSkitch from './Pages/Sketches/EditSkitch';
import Add_Designer from './Pages/Sketches/NewSketch/Add_Designer';
import ViewModel from './Pages/Sketches/NewSketch/ViewModel';
import ViewSketchs from './Pages/Sketches/ViewSketchs';
function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    console.log('Sidebar toggled:', !isSidebarOpen);
  };
  

  return (
    <div className="app-container">
      <div className="layout-container">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-wrapper">
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchedToken = Cookies.get("authToken");
    setToken(fetchedToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = Cookies.get("authToken");
      setToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isTokenValid = token && token !== "undefined" && token.trim() !== "";

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const router = createBrowserRouter([
   
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: "/login",
          element:  <Login />,
        },
        {
          path: "/",
          element: isTokenValid ? <DashBoard /> : <Login />,
        },

        {
          path: "/createOrder",
          element: isTokenValid ? <CreatePdOrder /> : <Login />,
        },
        {
          path: "/approvalLists",
          element: isTokenValid ? <ApprovalLists /> : <Login />,
        },
        {
          path: "/pdLists",
          element: isTokenValid ? <PdLists /> : <Login />,
        },
        {
          path: "/pdedit/:id",
          element: isTokenValid ? <EditPd /> : <Login />,
        },
        {
          path: "/vieworder/:id",
          element: isTokenValid ? <Vieworder /> : <Login />,
        },

        {
          path: "/sketchlist",
          element: isTokenValid ? <SketchList /> : <Login />,
        },
        {
          path: "/sketch_approvalLists",
          element: isTokenValid ? <SketchApprovalList /> : <Login />,
        },
        {
          path: "/edit/:id",
          element: isTokenValid ? <EditSkitch /> : <Login />,
        },
        {
          path: "/add_sketch",
          element: isTokenValid ? <Add_Sketch /> : <Login />,
        },
        {
          path: "/add_sketchdesigner",
          element: isTokenValid ? <Add_Designer /> : <Login />,
        },
        {
          path: "/view_sketch_model",
          element: isTokenValid ? <ViewModel /> : <Login />,
        },
        {
          path: "/viewsketch/:id",
          element: isTokenValid ? <ViewSketchs /> : <Login />,
        },



        // { path: '/', element: <DashBoard /> },
        { path: '/about', element: <About /> },
        { path: '/list_employe', element: <EmployeeList /> },
        { path: '/add_employee', element: <AddEmployee /> },
        
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;