import React, { useState } from "react";

const ApprovalListTable = () => {
  const [approvalStatus, setApprovalStatus] = useState("Approved");
  return (
    <tr>
      <td>c-108</td>
      <td>10 Feb 2025</td>
      <td>Dew Diamonds</td>
      <td>Diamond Nosepin</td>
      <td>20 Feb 2025</td>
      <td>
        <select
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value)}
          className="form-select"
        >
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
          <option value="Initiated">Initiated</option>
        </select>
      </td>
      <td>Moved to Sketch</td>
    </tr>
  );
};

export default ApprovalListTable;
