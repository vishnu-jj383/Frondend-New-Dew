import React, { useState, useEffect } from 'react';
import axios from "axios";
import Footer from '../../Components/Footer';
import Content from '../../Components/Content';
import { useNavigate, useParams } from "react-router";
import Cookies from 'js-cookie';
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
function EditRender() {
    const { renderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    //  const sideBarState = useSelector(state => state?.sidebar?.sideBar)
    // State variables for render details
    const [id, setId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [renderBriefDate, setRenderBriefDate] = useState("");
    const [renderCompletedDate, setRenderCompletedDate] = useState("");
    const [reqRenderCount, setReqRenderCount] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    
    const API_URL =  window.url+`render/getRenderById/${renderId}`;

    useEffect(() => {
        const savedToken = Cookies.get("authToken");
        if (!savedToken) {
            navigate("/");
            return;
        }

        const fetchRenderDetails = async () => {
            try {
                const response = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                const renderData = response.data.data || {};
                
                setId(renderData.id || "");
                setOrderId(renderData.orderId || "");
                // Ensure dates are in YYYY-MM-DD format
                const briefDate = renderData.renderBriefDate 
                    ? new Date(renderData.renderBriefDate).toISOString().split('T')[0] 
                    : "";
                const completedDate = renderData.renderCompletedDate 
                    ? new Date(renderData.renderCompletedDate).toISOString().split('T')[0] 
                    : "";
                setRenderBriefDate(briefDate);
                setRenderCompletedDate(completedDate);
                setReqRenderCount(renderData.reqRenderCount || "");
                setSpecialInstructions(renderData.specialInstructions || "");
            } catch (err) {
                setError("Failed to fetch render data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRenderDetails();
    }, [navigate, renderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await Swal.fire({
              title: "Do you want to save changes?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Yes, save it!",
              cancelButtonText: "No, cancel",
            });
        
            if (!result.isConfirmed) {
              // If the user cancels, do nothing
              return;
            }
        const savedToken = Cookies.get("authToken");
        if (!savedToken) {
            Swal.fire({
                icon: "warning",
                title: "Authorization Error",
                text: "Authorization token not found.",
            });
            return;
        }
    
        try {
            const response = await axios.put(
                window.url + `render/updateRender/${renderId}`,
                {
                    renderBriefDate: renderBriefDate,
                    renderCompletedDate: renderCompletedDate,
                    reqRenderCount: parseInt(reqRenderCount),
                    specialInstructions: specialInstructions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
    
            Swal.fire({
                icon: "success",
                title: "Render Updated",
                text: "The render details have been successfully updated.",
            }).then(() => {
                navigate("/render_list");
            });
    
        } catch (error) {
            console.error("Error updating render:", error);
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "There was an error updating the render. Please try again.",
            });
        }
    };
    // Helper function to format date to YYYY-MM-DDTHH:MM for datetime-local
   

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
       <main className="main-content">
   
    <Content>
            <div className="">
                <div className="page-inner">
                    <div className="page-header">
                        {/* <h5>Edit Render</h5> */}
                    </div>
                    <div className="card">
                        {/* Card Header */}
                        <div className="card-header">
                          <center><h6>Edit Render </h6></center>  
                        </div>
                        
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Order ID */}
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label>Render ID</label>
                                            <input type="text" className="form-control" value={id} onChange={(e) => setOrderId(e.target.value)} required disabled />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label>Concept ID</label>
                                            <input type="text" className="form-control" value={orderId} onChange={(e) => setOrderId(e.target.value)} required disabled />
                                        </div>
                                    </div>

                                    
    
                                    {/* Render Brief Date */}
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label>Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={renderBriefDate}
                                                onChange={(e) => setRenderBriefDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
    
                                <div className="row">
                                    {/* Render Completed Date */}
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label>Render Completed Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={renderCompletedDate}
                                                onChange={(e) => setRenderCompletedDate(e.target.value)}
                                                min={renderBriefDate} // Restrict to dates after start date
                                                disabled={!renderBriefDate} // Disable until start date is selected
                                                required
                                            />
                                            {/* <input type="date" className="form-control" value={renderCompletedDate} onChange={(e) => setRenderCompletedDate(e.target.value)} required /> */}
                                        </div>
                                    </div>
    
                                    {/* Requested Render Count */}
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="comment">Requested Render Count</label>
                                            <input type="number" className="form-control" value={reqRenderCount} onChange={(e) => setReqRenderCount(e.target.value)}  />
                                        </div>
                                    </div>
                                    
                                </div>
    
                                {/* Special Instructions */}
                                <div className="form-group">
                                    <label>Special Instructions</label>
                                    <textarea className="form-control"   rows="5" value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}  />
                                </div>
    
                                {/* Buttons */}
                                <br></br>
                                <center>
                                <button type="submit" className="btn" style={{backgroundColor:"#2E1A47",color:"white"}}>Submit</button>&nbsp;&nbsp;&nbsp;
                                {/* <button type="button" className="btn btn-danger" onClick={() => navigate("/renders")}>Cancel</button> */}
                                </center>
                                
                            </form>
                        </div>
                    </div>
                </div>
            </div>
           </Content>
    <Footer />
  </main>
    
    );
}

export default EditRender;
