import React from "react";
import { useNavigate } from "react-router-dom";
// import SideBar from "../../SideBar";
// import Header from "../../Header";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import "./Model.css"; // Ensure the CSS file is imported

function ViewModel() {
  const navigate = useNavigate();

  const handleAddSketchDesigner = () => {
    navigate(`/add_sketchdesigner`);
  };
  const handleAddSketch = () => {
    navigate("/add_sketch");
  };

  return (
    <main className="main-content">
      <br /> <br />
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="card view-model-card">
              <div className="card-body">
                <h2 className="page-title">Add New Sketch</h2>
                <div className="button-container">
                  <button
                    className="btn action-btn"
                    onClick={handleAddSketchDesigner}
                  >
                    Add Sketch Designer
                  </button>
                  <button className="btn action-btn" onClick={handleAddSketch}>
                    Create Sketch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default ViewModel;
