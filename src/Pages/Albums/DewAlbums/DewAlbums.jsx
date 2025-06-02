import React, { useState } from "react";

import Content from "../../../Components/Content";
import Footer from "../../../Components/Footer";
import DewAlbumDetail from "./DewAlbumDetail";
import { Button } from "antd";
// import { useSelector } from "react-redux";

const DewAlbums = () => {
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    customer: "",
    orderId: "",
  });

  const [selectedCount, setSelectedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header"></div>

            {/* <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-datatables"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr>
                          <th style={{whiteSpace:"nowrap"}}>Select</th>
                          <th style={{whiteSpace:"nowrap"}}>Design No</th>
                                
                                <th style={{whiteSpace:"nowrap"}}>Category</th>
                                <th style={{whiteSpace:"nowrap"}}>Subcategory</th>
                                <th>Image</th>
                                <th>ProductType</th>
                                <th style={{whiteSpace:"nowrap"}}>Expected Gross Wt</th>
                                <th style={{whiteSpace:"nowrap"}}>Brand</th>
                                <th style={{whiteSpace:"nowrap"}}>Metal</th>
                               
                                <th>Metal Color</th>
                          </tr>
                        </thead>
                       
                          <DesignBankTable setSelectedCount={setSelectedCount} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}   />
                         
                       
                      </table>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            <DewAlbumDetail
              setSelectedCount={setSelectedCount}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
};
export default DewAlbums;
