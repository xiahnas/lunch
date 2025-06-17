import React, { useState, useRef, useEffect } from 'react';

export default function BgmPlayer() {
  const [isBgmOn, setIsBgmOn] = useState(true);      // 기본 ON
  const [volume, setVolume] = useState(0.5);         // 0~1 범위, 50%
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isBgmOn) {
        audioRef.current.play().catch(() => {
          // 자동재생 차단 시 에러 무시
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isBgmOn, volume]);

  const toggleBgm = () => {
    setIsBgmOn(prev => !prev);
  };

  const onVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button
        onClick={toggleBgm}
        style={{
          fontSize: '1.2rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: isBgmOn ? '#4caf50' : '#f44336',
          color: 'white',
        }}
      >
        {isBgmOn ? 'BGM ON 🔊' : 'BGM OFF 🔇'}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={onVolumeChange}
        style={{ cursor: 'pointer', width: '150px' }}
      />

      <audio
        ref={audioRef}
        src="/bgm.mp3"    {/* public 폴더에 넣은 파일명 맞춰서 바꾸세요 */}
        loop
        autoPlay
      />
    </div>
  );
}
