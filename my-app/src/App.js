function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#000000", // KSU Black
        color: "#FFC61E"            // KSU Gold
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
        IT7993 Project 19 Group 2
      </h1>

      <h2 style={{ fontSize: "28px", color: "#FFFFFF", marginBottom: "30px" }}>
        Teaching Caminos Compass
      </h2>

      <div
        style={{
          backgroundColor: "#1A1A1A",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "700px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}
      >
        <p style={{ fontSize: "18px", color: "#FFC61E", lineHeight: "1.6" }}>
          A digital platform designed to support teachers of multilingual learners
          through a structured, reflective 6‑Paso process.
        </p>
      </div>
    </div>
  );
}

export default App;