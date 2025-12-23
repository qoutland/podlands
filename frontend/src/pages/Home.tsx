export default function Home() {
  const skills = [
    { category: "Cloud & Infrastructure", items: ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "Helm"] },
    { category: "DevOps & CI/CD", items: ["GitHub Actions", "Jenkins", "ArgoCD", "GitOps", "Monitoring", "Observability"] },
    { category: "Languages", items: ["Python", "TypeScript", "JavaScript", "Go", "Bash", "YAML"] },
    { category: "Platforms & Tools", items: ["FastAPI", "React", "Linux", "Prometheus", "Grafana", "ELK Stack"] },
  ];

  const workExperience = [
    {
      title: "Staff Software Engineer - Infrastructure",
      company: "LeanTaaS Inc.",
      location: "Santa Clara, CA / Remote",
      period: "2020 - Present",
      description: "Built and maintained the infrastructure for the LeanTaaS platform, including the Kubernetes cluster, CI/CD pipelines, and monitoring systems.",
      achievements: [
        "Achievement or responsibility bullet point",
        "Another key achievement or responsibility",
        "Notable contribution or project"
      ]
    },
    {
      title: "Previous Position",
      company: "Company Name",
      location: "Location",
      period: "2022 - 2024",
      description: "Key responsibilities and achievements at this position.",
      achievements: [
        "Achievement or responsibility bullet point",
        "Another key achievement or responsibility"
      ]
    },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Hero Section */}
      <section style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="podlands-title" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>
          Quin Outland
        </h1>
        <p style={{ fontSize: "clamp(1rem, 3vw, 1.3rem)", marginBottom: "1rem", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
          DevOps Engineer & Cloud Architect
        </p>
        <p style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8", padding: "0 1rem" }}>
          Building scalable infrastructure, automating everything, and turning chaos into order. 
          Passionate about cloud-native technologies, containerization, and making systems resilient.
        </p>
      </section>

      {/* About Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          About Me
        </h2>
        <div className="podlands-card">
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", margin: 0, color: "#000" }}>
            I'm a DevOps engineer with a passion for building reliable, scalable infrastructure and automating 
            complex workflows. I specialize in cloud-native technologies, container orchestration, and creating 
            systems that can handle chaos while maintaining high availability.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", margin: "1rem 0 0 0", color: "#000" }}>
            Whether it's designing CI/CD pipelines, managing Kubernetes clusters, or implementing 
            infrastructure as code, I enjoy solving challenging problems and continuously learning new technologies.
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Skills & Technologies
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1.5rem" }}>
          {skills.map((skillGroup, idx) => (
            <div key={idx} className="podlands-card">
              <h3 style={{ 
                color: "#000", 
                marginTop: 0, 
                marginBottom: "1rem",
                fontSize: "1.2rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900
              }}>
                {skillGroup.category}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {skillGroup.items.map((skill, skillIdx) => (
                  <span
                    key={skillIdx}
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
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work Experience Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Work Experience
        </h2>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {workExperience.map((work, idx) => (
            <div key={idx} className="podlands-card">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                <h3 style={{ 
                  color: "#000", 
                  marginTop: 0, 
                  marginBottom: "0.25rem",
                  fontSize: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 900
                }}>
                  {work.title}
                </h3>
                <p style={{ 
                  color: "#000", 
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {work.company}
                </p>
                <p style={{ 
                  color: "#666", 
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 600
                }}>
                  {work.location} • {work.period}
                </p>
              </div>
              <p style={{ color: "#000", marginBottom: "1rem", fontSize: "1rem", lineHeight: "1.6" }}>
                {work.description}
              </p>
              <ul style={{ 
                color: "#000", 
                margin: 0,
                paddingLeft: "1.5rem",
                fontSize: "0.95rem",
                lineHeight: "1.8"
              }}>
                {work.achievements.map((achievement, aIdx) => (
                  <li key={aIdx} style={{ marginBottom: "0.5rem" }}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Get In Touch
        </h2>
        <div className="podlands-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#000" }}>
            Interested in working together or have questions? Let's connect!
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
            <a
              href="https://www.linkedin.com/in/qoutland/"
              target="_blank"
              rel="noopener noreferrer"
              className="podlands-button podlands-button-small"
              style={{ textDecoration: "none" }}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/qoutland"
              target="_blank"
              rel="noopener noreferrer"
              className="podlands-button podlands-button-small"
              style={{ textDecoration: "none" }}
            >
              GitHub
            </a>
            <a
              href="mailto:qoutland@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="podlands-button podlands-button-small"
              style={{ textDecoration: "none" }}
            >
              Mail
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
