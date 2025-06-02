import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import OTP3 from "../DewAlbum/otp3.png"; // Background image
import "../DewAlbum/Album.css"; // Import CSS file

function Album() {
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await axios.get(
          `${window.url}customerAlbums/getAlbumsByCustomerId/${customer_id}`
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
  }, [customer_id, navigate]);

  const handleFeedback = (designId) => {
    navigate(`/album_by_id/${designId}`);
  };

  return (
    <div className="">
      {/* Background Image */}
      <div className="album-background">
        <img src={OTP3} alt="Album Cover" className="album-cover" />
      </div>

     

      {/* Album Page */}
      <div className="album-grid">
        {designs.map((design, index) => (
          <div className="design-card" key={index}>
            <div className="design-image-container">
              <img
                alt={`Design ${index}`}
                src={design.imageUrls?.[0] || "/placeholder.jpg"}
                className="design-image"
              />
            </div>
            <div className="design-content">
              <h5 className="design-heading">Album {index + 1}</h5>
              <p><strong>Album No:</strong> {design.albumNo}</p>
              <p><strong>Created Date:</strong> {design.createdAt || "N/A"}</p>
              <button className="btn-primary" onClick={() => handleFeedback(design.id)}>
                View Designs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Album;