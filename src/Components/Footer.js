import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Elite Dashboard. All rights reserved.</p>
      <div className="footer-links">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/support">Support</Link>
      </div>
    </footer>
  );
}

export default Footer;