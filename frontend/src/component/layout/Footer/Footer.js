import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-container'>
        <p>Shopsphere &copy; 2023</p>
        <a
          href='https://github.com/ashwin-2309/shopsphere'
          target='_blank'
          rel='noopener noreferrer'
        >
          GitHub Repository
        </a>
      </div>
    </footer>
  );
}

export default Footer;
