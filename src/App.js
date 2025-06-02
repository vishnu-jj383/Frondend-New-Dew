import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./App.css";
import "./Table-Textbox-style.css";

import { useFetchCustomers } from "./Pages/atoms/CustomerAtom";
import Cookies from "js-cookie";

import Login from "./Pages/Accounts/login";
import Protect from "./Pages/Accounts/Protect";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Home from "./Pages/Home";
import About from "./Pages/About";

import EmployeeList from "./Pages/Employees/EmployeeList";
import AddEmployee from "./Pages/Employees/AddEmployee";
import EditEmploye from "./Pages/Employees/EditEmploye";
import ViewEmployee from "./Pages/Employees/ViewEmployee";
import DashBoard from "./Pages/Dashboard/DashBoard";

import ApprovalLists from "./Pages/PD-Order/ApprovalLists";
import PdLists from "./Pages/PD-Order/PdLists";
import CreatePdOrder from "./Pages/PD-Order/CreatePdOrder";
import EditPd from "./Pages/PD-Order/EditPd";
import Vieworder from "./Pages/PD-Order/Vieworder";

import SketchList from "./Pages/Sketches/SketchList";
import SketchApprovalList from "./Pages/Sketches/ApprovalLists";
import Add_Sketch from "./Pages/Sketches/NewSketch/Add_Sketch";
import EditSkitch from "./Pages/Sketches/EditSkitch";
import Add_Designer from "./Pages/Sketches/NewSketch/Add_Designer";
import ViewModel from "./Pages/Sketches/NewSketch/ViewModel";
import ViewSketchs from "./Pages/Sketches/ViewSketchs";
import GetSketchDesigner from "./Pages/Sketches/GetSketchDesigner";
import EditSketchDesigner from "./Pages/Sketches/EditSketchDesigner";
import Imageupload from "./Pages/Sketches/Imageupload";
import SketchGridView from "./Pages/Sketches/SketchGridView";

import CadList from "./Pages/CAD/CadList";
import CadApprovalList from "./Pages/CAD/CadApprovalList";
import CadGridview from "./Pages/CAD/CadGridview";
import EditCad from "./Pages/CAD/EditCad";
import CadMetal from "./Pages/CAD/CadMetal";
import GetDesignerList from "./Pages/CAD/GetDesignerList";
import EditDesigner from "./Pages/CAD/EditDesigner";
import CadImage from "./Pages/CAD/CadImage";
import ViewCad from "./Pages/CAD/ViewCad";
import Add_CAD from "./Pages/CAD/NewCAD/Add_CAD";
import Add_CAD_Designer from "./Pages/CAD/NewCAD/Add_CAD_Designer";
import ViewCADModel from "./Pages/CAD/NewCAD/ViewCADModel";
import GetMetal from "./Pages/CAD/GetMetalinformation/GetMetal";

import DesignerReports from "./Pages/Reports/DesignerReports/DesignerReports";
import DesignReports from "./Pages/Reports/DesignReports/DesignReports";
import DelivaryReport from "./Pages/Reports/DelivaryReport/DelivaryReport";
import FeedbackList from "./Pages/Reports/Feedback/FeedbackList";
import InsiteReport from "./Pages/Reports/InsiteReport/InsiteReport";
import ProgressReport from "./Pages/Reports/WorkingProgresReport/ProgressReport";

import CreateCustomer from "./Pages/Customers/CreateCustomer";
import ListCustomer from "./Pages/Customers/ListCustomer";
import EditCustomer from "./Pages/Customers/EditCustomer";
import ViewCustomerDetails from "./Pages/Customers/ViewCustomerDetails";

import RenderList from "./Pages/Render/RenderList";
import RenderApprovalList from "./Pages/Render/RenderApprovalList";
import EditRender from "./Pages/Render/EditRender";
import RenderDesignerList from "./Pages/Render/RenderDesignerList";
import RenderDesignEdit from "./Pages/Render/RenderDesignEdit";
import RenderGridview from "./Pages/Render/RenderGridview";
import Renderimage from "./Pages/Render/Renderimage";
import ViewRender from "./Pages/Render/ViewRender";

import DesignBank from "./Pages/Design/DesignBank/DesignBank";
import DesignMaster from "./Pages/Design/DesignMaster/DesignMaster";
import ListAlbum from "./Pages/Design/DesignBank/ListAlbum";
import ViewCustomerAlbum from "./Pages/Design/DesignBank/ViewCustomerAlbum";
import Album from "./Pages/Design/DewAlbum/Album";
import Feedback from "./Pages/Design/DewAlbum/Feedback";
import Album_By_id from "./Pages/Design/DewAlbum/Album_By_id";

import DewAlbums from "./Pages/Albums/DewAlbums/DewAlbums";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    console.log("Sidebar toggled:", !isSidebarOpen);
  };
  useFetchCustomers(); // Trigger API call on mount
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
      path: "/login",
      element: <Login />,
    },
    {
      path: "",
      element: (
        <Protect>
          <Layout />
        </Protect>
      ),
      children: [
        {
          path: "/",
          element: <DashBoard />,
        },
        {
          path: "/createOrder",
          element: <CreatePdOrder />,
        },
        {
          path: "/approvalLists",
          element: <ApprovalLists />,
        },
        // {
        //   path: "/pdLists",
        //   element: isTokenValid ? <PdLists /> : <Login />,
        // },
        {
          path: "/pdLists",
          element:  <PdLists /> ,
        },
        {
          path: "/pdedit/:id",
          element:  <EditPd /> ,
        },
        {
          path: "/vieworder/:id",
          element:  <Vieworder /> ,
        },

        {
          path: "/sketchlist",
          element:  <SketchList /> ,
        },
        {
          path: "/sketch_approvalLists",
          element:  <SketchApprovalList /> ,
        },
        {
          path: "/edit/:id",
          element:  <EditSkitch />  ,
        },
        {
          path: "/add_sketch",
          element:  <Add_Sketch /> ,
        },
        {
          path: "/add_sketchdesigner",
          element:  <Add_Designer /> ,
        },
        {
          path: "/view_sketch_model",
          element:  <ViewModel /> ,
        },

        {
          path: "/sketch_designer/:orderId",
          element:  <GetSketchDesigner /> ,
        },
        {
          path: "/sketch_designer_edit/:designerId",
          element:  <EditSketchDesigner /> ,
        },
        {
          path: "/sketch_image_upload/:designerId",
          element:  <Imageupload /> ,
        },
        {
          path: "/viewsketch/:id",
          element: <ViewSketchs /> ,
        },
        {
      path: "/sketchGridView",
      element:  <SketchGridView /> ,
    },


        {
      path: "/cadlist",
      element:<CadList /> ,
    },
    {
      path: "/cad_approval_list",
      element:  <CadApprovalList /> ,
    },
    {
      path: "/cad_edit/:customerId",
      element:  <EditCad /> ,
    },
    {
      path: "/cad_metal/:customerId",
      element:  <CadMetal /> ,
    },
    {
      path: "/cad_designer/:orderId",
      element:  <GetDesignerList /> ,
    },
    {
      path: "/cad_gridview",
      element:  <CadGridview /> ,
    },
    {
      path: "/cad_image_upload/:designerId",
      element: isTokenValid ? <CadImage /> : <Login />,
    },
    {
      path: "/designer_edit/:designerId",
      element: <EditDesigner /> ,
    },
    {
      path: "/viewcad/:id",
      element:  <ViewCad /> ,
    },
    {
      path: "/add_cad",
      element:  <Add_CAD /> ,
    },
    {
      path: "/add_caddesigner",
      element:  <Add_CAD_Designer /> ,
    },
    {
      path: "/view_cad_Model",
      element:  <ViewCADModel /> ,
    },
     {
      path: "/get_metal/:customerId",
      element:  <GetMetal /> ,
    },


    {
      path: "/render_list",
      element:<RenderList />  ,
    },
    {
      path: "/renderApproval__list",
      element: <RenderApprovalList /> ,
    },
    {
      path: "/render_edit/:renderId",
      element:  <EditRender /> ,
    },
    {
      path: "/render_designer/:orderId",
      element:  <RenderDesignerList /> ,
    },


    {
      path: "/render_designer_edit/:designerId",
      element:  <RenderDesignEdit /> ,
    },
    {
      path: "/render_gridview",
      element:  <RenderGridview /> ,
    },
    {
      path: "/render_image_upload/:designerId",
      element:  <Renderimage /> ,
    },
    {
      path: "/viewrender/:id",
      element:  <ViewRender /> ,
    },



    {
      path: "/designBank",
      element:  <DesignBank /> ,
    },
    {
      path: "/designMaster",
      element:  <DesignMaster /> ,
    },
    {
      path: "/list_album",
      element:  <ListAlbum /> ,
    },
    {
      path: "/view_customer_album/:customer_id",
      element: <ViewCustomerAlbum /> ,
    },
    // {
    //   path: "/album/:customer_id",
    //   element: isTokenValid ? <Album /> : <Login />,
    // },
    {
      path: "/album/:customer_id",
      element: <Album /> ,
    },
    {
      path: "/album_by_id/:customer_id",
      element: <Album_By_id /> ,
    },
    // {
    //   path: "/feedback/:customer_id",
    //   element: isTokenValid ? <Feedback /> : <Login />,
    // },
    {
      path: "/feedback/:customer_id",
      element:  <Feedback /> ,
    },

     {
      path: "/dewAlbum",
      element:  <DewAlbums /> ,
    },

    {
      path: "/designReports",
      element: <DesignReports /> ,
    },
    {
      path: "/designerReports",
      element: isTokenValid ? <DesignerReports /> : <Login />,
    },
    {
    path: "/feedbacklist",
    element: isTokenValid ? <FeedbackList /> : <Login />,
  },
  {
    path: "/delivery_report",
    element: isTokenValid ? <DelivaryReport /> : <Login />,
  },
  {
    path: "/working_progress_report",
    element: isTokenValid ? <ProgressReport /> : <Login />,
  },
  {
    path: "/insightReports",
    element: isTokenValid ? <InsiteReport /> : <Login />,
  },

   {
      path: "/customer__list",
      element: isTokenValid ? <ListCustomer /> : <Login />,
    },
    {
      path: "/edit-customer/:customerId",
      element: isTokenValid ? <EditCustomer /> : <Login />,
    },
    {
      path: "/create_customer",
      element: isTokenValid ? <CreateCustomer /> : <Login />,
    },
    {
      path: "/customerDetails/:customerId",
      element: isTokenValid ? <ViewCustomerDetails /> : <Login />,
    },

     { path: "/list_employe", element: <EmployeeList /> },
    { path: "/add_employee", element: <AddEmployee /> },
    {
      path: "/employee_edit/:id",
      element: isTokenValid ? <EditEmploye /> : <Login />,
    },
    {
      path: "/view_employee/:empId",
      element: isTokenValid ? <ViewEmployee /> : <Login />,
    },


    

   

        // { path: '/', element: <DashBoard /> },
        { path: "/about", element: <About /> },
       
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
