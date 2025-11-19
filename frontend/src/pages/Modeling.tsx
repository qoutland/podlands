export default function Modeling() {

  const prints = [
    {
      title: "3D Printed Object",
      description: "Detailed description of your 3D print project, including materials, printer settings, and post-processing techniques.",
      images: [],
      tags: ["PLA", "Functional Print", "Custom Design"],
      date: "2024"
    },
    {
      title: "Character Model",
      description: "A custom character model designed and 3D printed, featuring intricate details and multiple parts.",
      images: [],
      tags: ["Resin", "Miniature", "Painted"],
      date: "2024"
    },
    {
      title: "Engineering Project",
      description: "Functional engineering component designed in CAD and 3D printed for prototyping and testing.",
      images: [],
      tags: ["PETG", "Functional", "CAD Design"],
      date: "2024"
    },
  ];

  const models = [
    {
      title: "3D Model Collection",
      description: "Various 3D models created using Blender, Fusion 360, or other modeling software.",
      software: ["Blender", "Fusion 360"],
      tags: ["Character Design", "Product Design", "Architecture"]
    },
    {
      title: "Game Asset Models",
      description: "3D models created for game development projects, optimized for real-time rendering.",
      software: ["Blender", "Substance Painter"],
      tags: ["Game Assets", "Low Poly", "Textured"]
    },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Hero Section */}
      <section style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="podlands-title" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>
          3D Prints & Modeling
        </h1>
        <p style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8", padding: "0 1rem" }}>
          Exploring the world of 3D printing and digital modeling. From functional prints to artistic creations, 
          combining design skills with fabrication technology.
        </p>
      </section>

      {/* 3D Prints Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          3D Prints
        </h2>
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))" }}>
          {prints.map((print, idx) => (
            <div key={idx} className="podlands-card">
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                {print.title}
              </h3>
              <p style={{ color: "#000", marginBottom: "1rem", fontSize: "1rem", lineHeight: "1.6" }}>
                {print.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {print.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    style={{
                      display: "inline-block",
                      padding: "0.3rem 0.6rem",
                      background: "rgba(255, 107, 53, 0.2)",
                      border: "2px solid #ff6b35",
                      color: "#000",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ color: "#000", fontSize: "0.9rem", margin: 0, opacity: 0.7 }}>
                {print.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Modeling Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          3D Modeling
        </h2>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {models.map((model, idx) => (
            <div key={idx} className="podlands-card">
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                {model.title}
              </h3>
              <p style={{ color: "#000", marginBottom: "1rem", fontSize: "1rem", lineHeight: "1.6" }}>
                {model.description}
              </p>
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: "#000", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
                  Software:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {model.software.map((software, swIdx) => (
                    <span
                      key={swIdx}
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.8rem",
                        background: "rgba(0,0,0,0.15)",
                        border: "2px solid #000",
                        color: "#000",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "2px 2px 0px #000"
                      }}
                    >
                      {software}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {model.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    style={{
                      display: "inline-block",
                      padding: "0.3rem 0.6rem",
                      background: "rgba(255, 107, 53, 0.2)",
                      border: "2px solid #ff6b35",
                      color: "#000",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools & Technologies Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Tools & Technologies
        </h2>
        <div className="podlands-card">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            <div>
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "1rem",
                fontSize: "1.2rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                Software
              </h3>
              <ul style={{ color: "#000", margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>Blender</li>
                <li>Fusion 360</li>
                <li>PrusaSlicer</li>
                <li>Cura</li>
                <li>MeshMixer</li>
              </ul>
            </div>
            <div>
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "1rem",
                fontSize: "1.2rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                Materials
              </h3>
              <ul style={{ color: "#000", margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>PLA</li>
                <li>PETG</li>
                <li>TPU</li>
                <li>Resin</li>
                <li>ABS</li>
              </ul>
            </div>
            <div>
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "1rem",
                fontSize: "1.2rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                Skills
              </h3>
              <ul style={{ color: "#000", margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>CAD Design</li>
                <li>Sculpting</li>
                <li>Topology</li>
                <li>UV Mapping</li>
                <li>Post-Processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

