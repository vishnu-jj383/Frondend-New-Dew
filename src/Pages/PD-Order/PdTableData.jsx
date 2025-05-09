import { useState } from "react";
import { FaEllipsisV, FaEye } from "react-icons/fa";

const PdTableData = ({data}) => {
  const [toggle, setToggle] = useState(false);

  const customerName = data["Customer.customer_first_name"];
  return (
    <tr>
      <td>
        <FaEye className="text-primary" />
      </td>
      <td>{data?.orderDate}</td>
      <td>{data?.orderNo}</td>
      <td>{customerName}</td>
      <td>{data?.promiseDate}</td>
      <td>{data?.status}</td>
      <td>sk-142</td>
      <td>5</td>
      <td>1</td>
      <td style={{ position: "relative" }} onClick={() => setToggle(!toggle)}>
        {!toggle && <FaEllipsisV className="text-secondary" style={{ cursor: "pointer" }} />}
        {toggle && (
        <span
          className="pd-edit-btn"
          style={{
            position: "relative",
            top: "0px",
            right: "19px",
            background: "#2a2f5b",
            color: "white",
            padding: "7px 4px",
            cursor: "pointer"
          }}
        >
          Edit
        </span>
      )}
      </td>
      
    </tr>
  );
};

export default PdTableData;
