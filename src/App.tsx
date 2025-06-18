import { useState, useEffect } from 'react'
import VideoPlayer from './components/VideoPlayer'
import './App.css'

function App() {
  // Initialize from localStorage or default to true
  const [useFakeAd, setUseFakeAd] = useState(() => {
    const stored = localStorage.getItem('useFakeAd');
    return stored === null ? true : stored === 'true';
  });
  // Using a sample HLS stream from a public source
  const hlsStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  useEffect(() => {
    localStorage.setItem('useFakeAd', useFakeAd.toString());
  }, [useFakeAd]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    localStorage.setItem('useFakeAd', value.toString());
    window.location.reload();
  };

  return (
    <div className="app">
      <h1>HLS Video Player Demo</h1>
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={useFakeAd}
            onChange={handleToggle}
          />
          Use Fake Ads
        </label>
      </div>
      <VideoPlayer src={hlsStreamUrl} useFakeAd={useFakeAd} />
    </div>
  )
}

export default App
