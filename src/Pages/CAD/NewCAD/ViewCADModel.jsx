import React from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import "./Model.css"; // Ensure the CSS file is imported

function ViewCADModel() {
  const navigate = useNavigate();

  const handleAddCADDesigner = () => {
    navigate(`/add_caddesigner`);
  };
  const handleAddCAD = () => {
    navigate("/add_cad");
  };

  return (
    <main className="main-content">
      <br /> <br />
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="card view-model-card">
              <div className="card-body">
                <h2 className="page-title">Add New CAD</h2>
                <div className="button-container">
                  <button
                    className="btn action-btn"
                    onClick={handleAddCADDesigner}
                  >
                    Add CAD Designer
                  </button>
                  <button className="btn action-btn" onClick={handleAddCAD}>
                    Create CAD
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

export default ViewCADModel;
