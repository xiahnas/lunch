import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [list, setList] = useState([]);
  const [available, setAvailable] = useState([]);
  const [banned, setBanned] = useState([]);
  const [selected, setSelected] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [bgmOn, setBgmOn] = useState(true);

  useEffect(() => {
    fetch("/list.txt")
      .then((res) => res.text())
      .then((data) => {
        const items = data.split("\n").map((line) => line.trim()).filter(Boolean);
        setList(items);
        setAvailable(items);
      });
  }, []);

  const toggleBan = () => {
    if (!selected) return;
    if (available.includes(selected)) {
      setAvailable(available.filter(item => item !== selected));
      setBanned([...banned, selected]);
    } else if (banned.includes(selected)) {
      setBanned(banned.filter(item => item !== selected));
      setAvailable([...available, selected]);
    }
    setSelected(null);
  };

  const showRandom = () => {
    const random = available[Math.floor(Math.random() * available.length)];
    setSelected(random);
    setPopupOpen(true);
  };

  const toggleBgm = () => {
    setBgmOn(!bgmOn);
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>밴 셀렉터</h1>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
        <div style={{ width: "45%" }}>
          <h2>선택 가능</h2>
          <div style={{ border: "1px solid #ccc", padding: 10, maxHeight: 300, overflowY: "auto" }}>
            {available.map(item => (
              <div
                key={item}
                onClick={() => setSelected(item)}
                style={{
                  cursor: "pointer",
                  padding: "5px 10px",
                  marginBottom: 5,
                  backgroundColor: selected === item ? "#007bff" : "#f8f8f8",
                  color: selected === item ? "#fff" : "#000",
                  borderRadius: 4
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "45%" }}>
          <h2>밴 목록</h2>
          <div style={{ border: "1px solid #ccc", padding: 10, maxHeight: 300, overflowY: "auto" }}>
            {banned.map(item => (
              <div
                key={item}
                onClick={() => setSelected(item)}
                style={{
                  cursor: "pointer",
                  padding: "5px 10px",
                  marginBottom: 5,
                  backgroundColor: selected === item ? "#dc3545" : "#f8f8f8",
                  color: selected === item ? "#fff" : "#000",
                  borderRadius: 4
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={showRandom} style={{ marginRight: 10 }}>무작위 선택</button>
        <button onClick={toggleBan} style={{ marginRight: 10 }}>밴/복귀</button>
        <button onClick={toggleBgm}>
          {bgmOn ? "BGM 끄기" : "BGM 켜기"}
        </button>
      </div>

      {popupOpen && (
        <div style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: "#eee",
          textAlign: "center",
          borderRadius: 8,
          fontSize: 24
        }}>
          🎯 선택된 항목: <strong>{selected}</strong>
          <div>
            <button onClick={() => setPopupOpen(false)} style={{ marginTop: 10 }}>닫기</button>
          </div>
        </div>
      )}

      {bgmOn && (
        <audio src="/Teamwork Wins Championships  LCK Music.mp3" autoPlay loop />
      )}
    </div>
  );
}

export default App;
