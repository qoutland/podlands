export default function Projects() {

  const projects = [
    {
      title: "PodLands Arena (This site)",
      description: "Interactive Kubernetes chaos engineering playground with real-time pod monitoring and destruction capabilities.",
      tech: ["React", "Python", "Kubernetes", "Flux" ],
      link: "/arena"
    },
    {
      title: "Infrastructure as Code",
      description: "Scalable cloud infrastructure deployments using Terraform and GitOps workflows.",
      tech: ["Terraform", "AWS", "GitOps", "CI/CD"]
    },
    {
      title: "PyWar",
      description: "Python simulation of the classic game War.",
      tech: ["Python"],
      link: "/pywar"
    }

  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <section style={{ marginBottom: "3rem" }}>
      <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
        Featured Projects
      </h2>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {projects.map((project, idx) => (
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
              {project.title}
            </h3>
            <p style={{ color: "#000", marginBottom: "1rem", fontSize: "1rem", lineHeight: "1.6" }}>
              {project.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {project.tech.map((tech, techIdx) => (
                <span
                  key={techIdx}
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
                  {tech}
                </span>
              ))}
            </div>
            {project.link && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <a 
                  href={project.link}
                  className="podlands-button podlands-button-small"
                  style={{ 
                    textDecoration: "none", 
                    display: "inline-block"
                  }}
                >
                  View Project →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}

  