
export default function Home() {
  return (
    <div
      style={{
        background: "#050816",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ color: "#00ff99", fontSize: "40px" }}>
        SMART TRADE SIGNALS
      </h1>

      <p style={{ color: "#aaa", marginTop: "10px" }}>
        High Probability Crypto Signals
      </p>

      <div
        style={{
          marginTop: "40px",
          background: "#10182b",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <h2>BTC/USDT</h2>

        <p>Signal: LONG</p>
        <p>Entry Zone: 66,800 - 67,200</p>
        <p>Stop Loss: 65,200</p>
        <p>Take Profit: 69,800</p>
        <p>Confidence: 85%</p>
        <p>Holding Time: 18 - 36 Hours</p>
      </div>
    </div>
  );
}
