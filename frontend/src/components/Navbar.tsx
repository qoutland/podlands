import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav style={{
      borderBottom: "6px solid #000",
      background: "linear-gradient(145deg, #ffd442 0%, #ffb800 100%)",
      boxShadow: "0 6px 0px #000, inset 0 -4px 0px rgba(0,0,0,0.2)",
      position: "relative"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        position: "relative"
      }}>
        <button
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          style={{
            display: "none",
            background: "#ffd442",
            border: "3px solid #000",
            cursor: "pointer",
            padding: "0.5rem",
            boxShadow: "3px 3px 0px #000",
            flexShrink: 0
          }}
        >
          <span style={{
            display: "block",
            width: "25px",
            height: "3px",
            background: "#000",
            margin: "5px 0",
            transition: "all 0.3s ease"
          }}></span>
          <span style={{
            display: "block",
            width: "25px",
            height: "3px",
            background: "#000",
            margin: "5px 0",
            transition: "all 0.3s ease"
          }}></span>
          <span style={{
            display: "block",
            width: "25px",
            height: "3px",
            background: "#000",
            margin: "5px 0",
            transition: "all 0.3s ease"
          }}></span>
        </button>

        <div
          className={`nav-links ${isOpen ? "open" : ""}`}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/projects" onClick={closeMenu}>Projects</Link>
          <Link to="/arena" onClick={closeMenu}>PodLands Arena</Link>
          <Link to="/modeling" onClick={closeMenu}>3D Prints</Link>
        </div>

        <a
          href="/resume.pdf"
          download
          className="podlands-button podlands-button-small"
          style={{
            textDecoration: "none",
            flexShrink: 0
          }}
        >
          Resume
        </a>
      </div>
    </nav>
  );
}
