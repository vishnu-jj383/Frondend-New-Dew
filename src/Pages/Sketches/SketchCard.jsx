import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Card } from "antd";
import "./Grid.css"; // Import the CSS file

const { Meta } = Card;

const SketchCard = () => {
  const API_URL = window.url + "tasks/getTasksByOrderIdOrType";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Filters State
    const [promiseStartDate, setPromiseStartDate] = useState("");
    const [promiseEndDate, setPromiseEndDate] = useState("");
    const [completedStartDate, setCompletedStartDate] = useState("");
    const [completedEndDate, setCompletedEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const getDesignerData = async () => {
      setLoading(true);
      try {
        const requestData = { orderId: orderId, type: "sketch" };
        const response = await axios.post(API_URL, requestData, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data?.tasks && Array.isArray(response.data.tasks)) {
          setRows(response.data.tasks);
        } else {
          setError("Invalid API response format.");
        }
      } catch (err) {
        setError(`Failed to fetch Order data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getDesignerData();
  }, [navigate, orderId]);

   useEffect(() => {
      let updatedRows = rows;
      if (promiseStartDate && promiseEndDate) {
        updatedRows = updatedRows.filter(row => row.promiseDate >= promiseStartDate && row.promiseDate <= promiseEndDate);
      }
      if (completedStartDate && completedEndDate) {
        updatedRows = updatedRows.filter(row => row.cadCompletedDate >= completedStartDate && row.cadCompletedDate <= completedEndDate);
      }
      if (statusFilter) {
        updatedRows = updatedRows.filter(row => row.status === statusFilter);
      }
      setFilteredRows(updatedRows);
    }, [promiseStartDate, promiseEndDate, completedStartDate, completedEndDate, statusFilter, rows]);

  return (
    <div className="sketch-card-container">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No data found</p>}
      {!loading &&
        !error &&
        rows.length > 0 && (
          <div className="card-grid">
            {rows.map((design, index) => (
              <div className="card-item" key={index}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt="Design Preview"
                      src={design.imageUrls?.[0] || "/placeholder.jpg"}
                      className="card-image"
                    />
                  }
                >
                  <Meta title={`Sketch ID: ${design.sketchId || "N/A"}`} />
                  <Button className="antd_btn">Approve</Button>
                </Card>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SketchCard;
