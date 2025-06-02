import React from "react";

function MetalTable({ rows = [], onRemoveRow }) {
  console.log("Rows in MetalTable:", rows);

  const totalWeight = rows.reduce((sum, row) => sum + (parseFloat(row.grossWeight) || 0), 0);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <center><h4>Color-Stone Materials</h4></center>
          <div className="card-body">
            <div className="table-responsive">
              <table className="display table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Quality</th>
                   
                   
                    <th>Pieces</th>
                    <th>Gross Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map((row, index) => (
                      <tr key={index}>
                        <td>{row.metalTypeLabel || "N/A"}</td>
                        <td>{row.diamondStoneSizeLabel || "N/A"}</td>
                        <td>{row.colorStoneColorLabel || "N/A"}</td>
                        <td>{row.colorStoneQualityLabel || "N/A"}</td>
                       
                        
                        <td>{row.pieces || "0"}</td>
                        <td>{row.grossWeight || "0"}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onRemoveRow(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="7"><strong>Total</strong></td>
                    <td><strong>{totalWeight.toFixed(2)}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetalTable;