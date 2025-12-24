export default function Home() {
  const skills = [
    { category: "Cloud & Infrastructure", items: ["AWS", "GCP", "Kubernetes", "Docker", "DataDog", "Grafana"] },
    { category: "DevOps & CI/CD", items: ["Jenkins", "GitHub Actions", "ArgoCD", "FluxCD"] },
    { category: "Languages", items: ["Python", "Bash", "JavaScript", "Terraform", "Ansible", "SQL"] },
  ];

  const workExperience = [
    {
      title: "Staff Software Engineer - Infrastructure",
      company: "LeanTaaS Inc.",
      location: "Santa Clara, CA / Remote",
      period: "Mar 2020 - Present",
      description: "Built and maintained the infrastructure for the LeanTaaS platform, including the Kubernetes cluster, CI/CD pipelines, and monitoring systems.",
      achievements: [
        "Migrated from fully managed servers to near-serverless infrastructure",
        "Implemented CI/CD pipelines for the application for multiple product lines",
        "Created and designed infrastructure for messaging system accepting 10M+ messages per day",
        "Architected and automated a scalable VPN solution with 160+ customers"
      ]
    },
    {
      title: "Software Engineer ",
      company: "Rubrik Inc. (Taos) Contract",
      location: "Palo Alto, CA",
      period: "Aug 2019 - Feb 2020",
      description: "Developed Infrastructure Management and Provisioning Application for improved product demonstrations and private cloud management",
      achievements: [
        "Infrastructure for hosting application on Kubernetes",
        "Maintained system images and deployment models for this application"
      ]
    },
    {
      title: "Student Intern",
      company: "NVEnergy",
      location: "Reno, NV",
      period: "Oct 2016 - June 2019",
      description: "Maintained on premise infrastructure, ensured compliance with Government regulations and standards",
      achievements: [
        "Managed at scale infrastructure maintiaining energy production and distribution systems",
        "Ensured compliance with Government regulations and standards (NERC, FERC, CIP, etc.)",
        "Created and maintained a web application for monitoring lightning detection across the state of Nevada"
      ]
    },
  ];


  const education = [
    {
      title: "Bachelor of Science in Computer Science",
      creditor: "University of Nevada, Reno",
      period: "2016 - 2020",
      link: "https://www.unr.edu/degrees/majors/computer-science-engineering"
    },
    {
      title: "Docker Certified Associate",
      creditor: "Docker",
      period: "Aug 2019",
      link: "/certs/docker.pdf"
    },
    {
      title: "Certified Kubernetes Application Developer",
      creditor: "Linux Foundation",
      period: "Feb 2020",
      link: "/certs/ckad.pdf"
    },
    {
      title: "AWS Certified Cloud Practitioner",
      creditor: "Amazon Web Services",
      period: "Nov 2021",
      link: "https://www.credly.com/badges/66316742-e644-460f-be52-a89716f43c7a"
    }
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
          Passionate about cloud-native technologies, containerization, and improving the developer experience.
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

      {/* Education Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="podlands-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Education and Certifications
        </h2>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {education.map((edu, idx) => (
            <div key={idx} className="podlands-card">
              <h3 style={{ color: "#000", marginTop: 0, marginBottom: "0.25rem", fontSize: "1.5rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 900 }}>
                {edu.title}
              </h3>
              <p style={{ color: "#000", margin: 0, fontSize: "1rem", lineHeight: "1.6" }}>
                {edu.creditor} • {edu.period}
              </p>
              <a
                href={edu.link}
                target="_blank"
                rel="noopener noreferrer"
                className="podlands-button podlands-button-small"
                style={{ textDecoration: "none", left: "90%"}}
              >
                View
              </a>
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
