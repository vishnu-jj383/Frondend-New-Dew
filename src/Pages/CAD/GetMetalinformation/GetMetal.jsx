import React, { useEffect, useState } from "react";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

import "./GetMetal.css";

function GetMetal() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const serverUrl = window.url;
  const getMetalapidata_Url = `${serverUrl}cad/getAssemblyItemsByCadId`;

  const [goldData, setGoldData] = useState([]);
  const [diamondData, setDiamondData] = useState([]);
  const [colorstoneData, setColorstoneData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      if (!customerId) return;
      try {
        const requestData = { cadId: customerId };
        const response = await axios.post(getMetalapidata_Url, requestData, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });

        const savedData = response.data.data || [];

        // Gold Mapping (metalTypeId === 3)
        const goldRows = savedData
          .filter((item) => item.metalTypeId === 3)
          .map((item) => ({
            id: item.id || item.itemId,
            Type: item.product_types || item.make_name || "N/A",
            MetalClass: item.metal_class || item.material_class || "N/A",
            MetalColor: item.metal_color_name || "N/A",
            MetalQuality: item.metal_quality || "N/A",
            Gram: item.goldGram || 0,
            Pieces: item.pieces || 0,
            GrossWeight: item.grossWeight || 0,
          }));
        setGoldData(goldRows);

        // Diamond Mapping (metalTypeId === 2)
        const diamondRows = savedData
          .filter((item) => item.metalTypeId === 2)
          .map((item) => ({
            id: item.id || item.itemId,
            Type: item.product_types || item.make_name || "N/A",
            Diamondsize: item.sizeMm || item.sizeMm || "N/A",
            DiamondColor: item.diamond_color || "N/A",
            DiamondQuality: item.diamond_quality || "N/A",
            Pieces: item.pieces || 0,
            GrossWeight: item.grossWeight || 0,
          }));
        setDiamondData(diamondRows);

        // Colorstone Mapping (metalTypeId === 1)
        const colorstoneRows = savedData
          .filter((item) => item.metalTypeId === 1)
          .map((item) => ({
            id: item.id || item.itemId,
            Type: item.product_types || item.make_name || "N/A",
            Stonesize: item.sizeMm || item.sizeMm || "N/A",
            StoneColor: item.colorStoneColor || "N/A",
            StoneQuality: item.stone_quality || "N/A",

            Pieces: item.pieces || 0,
            GrossWeight: item.grossWeight || 0,
          }));
        setColorstoneData(colorstoneRows);
      } catch (err) {
        setError("Failed to fetch assembly items.", err.response);
        console.error("Error fetching data:", err.response || err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch assembly items. Please try again.",
        });
      }
    };

    if (customerId) fetchData();
  }, [navigate, customerId]);

  const calculateTotalWeight = (data) => {
    return data
      .reduce((total, item) => total + Number(item.GrossWeight), 0)
      .toFixed(4);
  };

  const handleDelete = async (itemId, metalTypeId) => {
    const savedToken = Cookies.get("authToken");
    const deleteUrl = `${serverUrl}cad/deleteAssemblyItem/${itemId}`;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(deleteUrl, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.status === 200 || response.data.success) {
            if (metalTypeId === 1) {
              setColorstoneData((prev) =>
                prev.filter((item) => item.id !== itemId)
              );
            } else if (metalTypeId === 2) {
              setDiamondData((prev) =>
                prev.filter((item) => item.id !== itemId)
              );
            } else if (metalTypeId === 3) {
              setGoldData((prev) => prev.filter((item) => item.id !== itemId));
            }
            Swal.fire("Deleted!", "The item has been deleted.", "success");
          } else {
            throw new Error("Deletion failed");
          }
        } catch (err) {
          console.error("Error deleting item:", err.response || err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete the item. Please try again.",
          });
        }
      }
    });
  };

  // Gold Table
  const renderGoldTable = (data) => {
    const totalWeight = calculateTotalWeight(data);
    return (
      <div className="get-metal-table-section">
        <h3>Gold Materials</h3>
        {data.length === 0 ? (
          <p>No items found for gold materials.</p>
        ) : (
          <>
            <div className="get-metal-table-wrapper">
              <table className="table table-bordered table-striped get-metal-table">
                <thead className="thead-dark">
                  <tr>
                    <th>Type</th>
                    <th>Metal Class</th>
                    <th>Metal Color</th>
                    <th>Metal Quality</th>

                    <th>Gross Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.Type}</td>
                      <td>{item.MetalClass}</td>
                      <td>{item.MetalColor}</td>
                      <td>{item.MetalQuality}</td>

                      <td>{item.GrossWeight}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id, 3)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right font-weight-bold get-metal-total-weight">
              Total Gross Weight: {totalWeight}
            </div>
          </>
        )}
      </div>
    );
  };

  // Diamond Table
  const renderDiamondTable = (data) => {
    const totalWeight = calculateTotalWeight(data);
    return (
      <div className="get-metal-table-section">
        <h3>Diamond Materials</h3>
        {data.length === 0 ? (
          <p>No items found for diamond materials.</p>
        ) : (
          <>
            <div className="get-metal-table-wrapper">
              <table className="table table-bordered table-striped get-metal-table">
                <thead className="thead-dark">
                  <tr>
                    <th>Type</th>
                    <th>Diamond Size</th>
                    <th>Diamond Color</th>
                    <th>Diamond Quality</th>
                    <th>Pieces</th>
                    <th>Gross Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.Type}</td>
                      <td>{item.Diamondsize}</td>
                      <td>{item.DiamondColor}</td>
                      <td>{item.DiamondQuality}</td>
                      <td>{item.Pieces}</td>
                      <td>{item.GrossWeight}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id, 2)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right font-weight-bold get-metal-total-weight">
              Total Gross Weight: {totalWeight}
            </div>
          </>
        )}
      </div>
    );
  };

  // Colorstone Table
  const renderColorstoneTable = (data) => {
    const totalWeight = calculateTotalWeight(data);
    return (
      <div className="get-metal-table-section">
        <h3>Colorstone Materials</h3>
        {data.length === 0 ? (
          <p>No items found for colorstone materials.</p>
        ) : (
          <>
            <div className="get-metal-table-wrapper">
              <table className="table table-bordered table-striped get-metal-table">
                <thead className="thead-dark">
                  <tr>
                    <th>Type</th>
                    <th>Stone Size</th>
                    <th>Stone Color</th>
                    <th>Stone Quality</th>

                    <th>Pieces</th>
                    <th>Gross Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.Type}</td>
                      <td>{item.Stonesize}</td>
                      <td>{item.StoneColor}</td>
                      <td>{item.StoneQuality}</td>

                      <td>{item.Pieces}</td>
                      <td>{item.GrossWeight}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id, 1)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right font-weight-bold get-metal-total-weight">
              Total Gross Weight: {totalWeight}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleBack = () => {
    navigate(`/cad_edit/${customerId}`);
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <button className="btn mb-3" onClick={handleBack}>
            <FaArrowLeft className="me-2" size={25} />
          </button>
          <div className="flex-grow-1 p-3">
            <center>
              <h2>Metal Details</h2>
            </center>
            {error && <div className="alert alert-danger">{error}</div>}
            {renderGoldTable(goldData)}
            {renderDiamondTable(diamondData)}
            {renderColorstoneTable(colorstoneData)}
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default GetMetal;
