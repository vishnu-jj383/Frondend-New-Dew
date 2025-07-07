import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useAtom } from "jotai";
import { designerListAtom } from "../../atoms/CustomerAtom";

function AddCAD_Designer({ selectedRowId, onClose, onSuccess }) {
const formatDateToLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

 const [designers] = useAtom(designerListAtom);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [designerName, setDesignerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isSubmitDisabled = !designerName || !startDate || !endDate;

  const navigate = useNavigate();

  useEffect(() => {
    console.log("AddSketchDesigner mounted with selectedRowId:", selectedRowId); // Debug log on mount
    return () => {
      console.log("AddSketchDesigner unmounted, selectedRowId was:", selectedRowId); // Debug log on unmount
    };
  }, [selectedRowId]);

  const handleCloseModal = () => {
    console.log("Closing modal, selectedRowId:", selectedRowId); // Debug log
    setIsModalOpen(false);
    setDesignerName("");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting with selectedRowId:", selectedRowId); // Debug log
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Token Missing",
        text: "Please log in to continue.",
      });
      navigate("/");
      return;
    }

    if (!designerName || !startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const hasStartDate = startDate && startDate.trim() !== "";
    const hasEndDate = endDate && endDate.trim() !== "";

    if ((hasStartDate || hasEndDate) && !(hasStartDate && hasEndDate)) {
      Swal.fire({
        icon: "warning",
        title: "Dates Required",
        text: "Both Start Date and End Date are required if one is provided.",
      });
      return;
    }

    if (hasStartDate && hasEndDate && new Date(endDate) < new Date(startDate)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Dates",
        text: "End Date cannot be before Start Date. Please correct the dates.",
      });
      return;
    }

    const dataToSend = {
      id: selectedRowId,
      empId: designerName,
      startDate: formatDateToLocal(startDate),
      endDate: formatDateToLocal(endDate),
       type: "cad",
    };
 
    try {
      const response = await axios.put(
        window.url + "cad/addCadDesigner",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "CAD Designer Created",
        text: "CAD Designer Created",
      });

      setDesignerName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
      onClose();
      onSuccess();
    } catch (error) {
      console.error(
        "Error creating Sketch Designer:",
        error.response ? error.response.data : error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error: " +
          (error.response
            ? JSON.stringify(error.response.data)
            : error.message),
      });
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h5>Add CAD Designer (CAD ID: {selectedRowId})</h5>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Designer Name</label>
                      <select
                        className="form-control"
                        id="settingType"
                        value={designerName}
                        onChange={(e) => setDesignerName(e.target.value)}
                      >
                        <option value="">Select</option>
                        {designers.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="startDateInput"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Select a date"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="endDateInput"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        disabled={!startDate}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success"  disabled={isSubmitDisabled} >
                  Submit
                </button>{" "} &nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddCAD_Designer