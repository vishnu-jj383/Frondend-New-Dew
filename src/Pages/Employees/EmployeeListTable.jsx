import React from "react";
import { MdEdit } from "react-icons/md";

const EmployeeListTable = () => {
  return (
    <tr>
      <td>17</td>
      <td>Abhijth</td>
      <td>Lenin</td>
      <td>N/A</td>
      <td>Engineer</td>
      <td>Admin</td>
      <td>Product</td>
      <td>9656425027</td>
      <td>abhi@gmail.com</td>
      <td><MdEdit style={{ cursor: "pointer" }}/></td>
    </tr>
  );
};

export default EmployeeListTable;
