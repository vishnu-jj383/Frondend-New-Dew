import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between">
        <div className="copyright text-center">
          <p className="mb-0">
            © {new Date().getFullYear()} Jobin & Jismi. All rights reserved.
          </p>
          <p className="mb-0">
            Product was developed and designed exclusively for Dew Diamonds by{" "}
            <a href="https://www.jobinandjismi.com/">Jobin & Jismi</a>.
            Unauthorized use, reproduction, or distribution of this product or
            any portion thereof is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
