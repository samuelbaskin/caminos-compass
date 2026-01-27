function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#F2F2F2" // pale gray
      }}
    >
      <div
        style={{
          backgroundColor: "#000000", // black box
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "700px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}
      >
        <h1 style={{ color: "#FFC61E", fontSize: "42px", marginBottom: "10px" }}>
          IT7993 Project 19 Group 2
        </h1>

        <h2 style={{ color: "#FFFFFF", fontSize: "28px", marginBottom: "20px" }}>
          Teaching Caminos Compass
        </h2>

        <p style={{ color: "#FFC61E", fontSize: "18px", lineHeight: "1.6" }}>
          A digital platform designed to support teachers of multilingual learners
          through a structured, reflective 6‑Paso process.
        </p>
      </div>
    </div>
  );
}

export default App;