import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 text-center text-gray-500 text-sm bg-gray-50">
      © {new Date().getFullYear()} InternshipFinder. All rights reserved.
    </footer>
  );
};

export default Footer;
