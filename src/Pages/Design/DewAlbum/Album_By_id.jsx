import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../DewAlbum/By_id.css";

function Album_By_id() {
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await axios.get(
          `${window.url}customerAlbums/getAllDesignsForAlbum/${customer_id}`
        );
        const customerData = response.data.data || [];

        if (customerData.length === 0) {
          setError("No designs found for this customer.");
        } else {
          setDesigns(customerData);
        }
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [customer_id]);

  const handleFeedback = (designId) => {
    navigate(`/feedback/${designId}`);
  };

  return (
    <div className="content-wrapper">
      {error && <p className="text-danger">{error}</p>}

      <div className="design-grid">
        {designs.map((design, index) => (
          <div className="design-card" key={index}>
            <img
              alt={`Design ${index}`}
              src={design.imageUrls?.[0] || "/placeholder.jpg"}
              className="design-image"
            />
            <div className="design-info">
              <h5 className="design-heading">Design {index + 1}</h5>
              <p><strong>Design Number:</strong> {design.Design?.designNo || "N/A"}</p>
              <p><strong>Category:</strong> {design.category_name}</p>
              <p><strong>Sent Date:</strong> {design.sentDate}</p>
              
              <button className="feedback-btn" onClick={() => handleFeedback(design.designId)}>
                Send Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Album_By_id;
