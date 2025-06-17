import React, { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [list, setList] = useState([]); // 전체 리스트 (초기 불러온 리스트 + 추가된 아이템 포함)
  const [available, setAvailable] = useState([]); // 선택 가능 리스트
  const [banned, setBanned] = useState([]); // 밴 목록
  const [selected, setSelected] = useState(null); // 현재 선택된 아이템
  const [popupOpen, setPopupOpen] = useState(false);
  const [bgmOn, setBgmOn] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [newItem, setNewItem] = useState(""); // 추가할 새 아이템 입력값

  // localStorage 키 이름
  const STORAGE_KEY = "lunchAppData";

  // localStorage에서 저장된 데이터 로드 또는 서버에서 list.txt 로드
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setList(parsed.list || []);
        setAvailable(parsed.available || []);
        setBanned(parsed.banned || []);
      } catch {
        loadFromTxt();
      }
    } else {
      loadFromTxt();
    }
  }, []);

  // list.txt 파일에서 기본 리스트 불러오기
  const loadFromTxt = () => {
    fetch("/list.txt")
      .then((res) => res.text())
      .then((data) => {
        const items = data
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        setList(items);
        setAvailable(items);
        setBanned([]);
        saveToStorage(items, items, []);
      });
  };

  // 상태 변경시 localStorage 저장
  const saveToStorage = (listData, availableData, bannedData) => {
    const data = {
      list: listData,
      available: availableData,
      banned: bannedData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // 배경음악 및 볼륨 컨트롤
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (bgmOn && hasInteracted) {
        audioRef.current.play().catch((err) => {
          console.log("Autoplay failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [bgmOn, volume, hasInteracted]);

  // 밴 토글 (선택된 아이템을 available <-> banned 이동)
  const toggleBan = () => {
    if (!selected) return;
    if (available.includes(selected)) {
      const newAvailable = available.filter((item) => item !== selected);
      const newBanned = [...banned, selected];
      setAvailable(newAvailable);
      setBanned(newBanned);
      saveToStorage(list, newAvailable, newBanned);
    } else if (banned.includes(selected)) {
      const newBanned = banned.filter((item) => item !== selected);
      const newAvailable = [...available, selected];
      setBanned(newBanned);
      setAvailable(newAvailable);
      saveToStorage(list, newAvailable, newBanned);
    }
    setSelected(null);
  };

  // 무작위 선택
  const showRandom = () => {
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    setSelected(random);
    setPopupOpen(true);
    if (!hasInteracted) setHasInteracted(true);
  };

  const toggleBgm = () => {
    setBgmOn((prev) => !prev);
    if (!hasInteracted) setHasInteracted(true);
  };

  const onVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    if (!hasInteracted) setHasInteracted(true);
  };

  // 새 아이템 추가 함수
  const addNewItem = () => {
    const trimmed = newItem.trim();
    if (
      trimmed &&
      !list.includes(trimmed) &&
      !available.includes(trimmed) &&
      !banned.includes(trimmed)
    ) {
      const newList = [...list, trimmed];
      const newAvailable = [...available, trimmed];
      setList(newList);
      setAvailable(newAvailable);
      setNewItem("");
      saveToStorage(newList, newAvailable, banned);
    }
  };

  // 선택 가능 목록에서 선택 후 삭제 버튼 클릭 시 아이템 제거
  const removeAvailableItem = () => {
    if (!selected) return;
    if (!available.includes(selected)) return;

    const newList = list.filter((item) => item !== selected);
    const newAvailable = available.filter((item) => item !== selected);
    // 밴 목록에는 없다고 가정 (만약 밴에도 있을 경우, 밴도 필터링 필요)
    const newBanned = banned.filter((item) => item !== selected);

    setList(newList);
    setAvailable(newAvailable);
    setBanned(newBanned);
    setSelected(null);
    saveToStorage(newList, newAvailable, newBanned);
  };

  return (
    <div
      className="App"
      style={{ padding: 20 }}
      onClick={() => setHasInteracted(true)}
    >
      <h1 style={{ textAlign: "center" }}>
        오점뭐(오늘 점심 뭐먹지 라는뜻ㅎ)
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 20,
        }}
      >
        {/* 선택 가능 영역 */}
        <div style={{ width: "30%" }}>
          <h2>선택 가능</h2>
          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {available.map((item) => (
              <div
                key={item}
                onClick={() => setSelected(item)}
                style={{
                  cursor: "pointer",
                  padding: "5px 10px",
                  marginBottom: 5,
                  backgroundColor: selected === item ? "#007bff" : "#f8f8f8",
                  color: selected === item ? "#fff" : "#000",
                  borderRadius: 4,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* 선택 가능 리스트에서 선택 후 제거 버튼 */}
          <button
            onClick={removeAvailableItem}
            disabled={!selected || !available.includes(selected)}
            style={{
              marginTop: 10,
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor:
                selected && available.includes(selected) ? "pointer" : "not-allowed",
            }}
            title="선택 가능 리스트에서 항목 제거"
          >
            제거
          </button>
        </div>

        {/* 밴 목록 영역 */}
        <div style={{ width: "30%" }}>
          <h2>밴 목록</h2>
          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {banned.map((item) => (
              <div
                key={item}
                onClick={() => setSelected(item)}
                style={{
                  cursor: "pointer",
                  padding: "5px 10px",
                  marginBottom: 5,
                  backgroundColor: selected === item ? "#dc3545" : "#f8f8f8",
                  color: selected === item ? "#fff" : "#000",
                  borderRadius: 4,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 리스트 추가 UI */}
        <div style={{ width: "30%" }}>
          <h2>리스트 추가</h2>
          <input
            type="text"
            placeholder="새 항목 입력"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNewItem();
            }}
            style={{
              width: "70%",
              padding: "5px 10px",
              marginRight: 10,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={addNewItem}
            style={{
              padding: "5px 10px",
              marginRight: 10,
              cursor: "pointer",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
            }}
            disabled={!newItem.trim()}
            title="리스트 추가"
          >
            리스트 추가
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={showRandom} style={{ marginRight: 10 }}>
          무작위 선택
        </button>
        <button onClick={toggleBan} style={{ marginRight: 10 }}>
          밴/복귀
        </button>
        <button onClick={toggleBgm} style={{ marginRight: 20 }}>
          {bgmOn ? "BGM 끄기" : "BGM 켜기"}
        </button>
        <label
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          볼륨
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={onVolumeChange}
            style={{ verticalAlign: "middle" }}
          />
        </label>
      </div>

      {popupOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setPopupOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 40,
              borderRadius: 8,
              fontSize: 40,
              fontWeight: "bold",
              cursor: "default",
              userSelect: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selected}
          </div>
        </div>
      )}

      <audio ref={audioRef} src="/bgm.mp3" loop preload="auto" />
    </div>
  );
}

export default App;
