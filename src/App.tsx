import { useState, useEffect } from 'react'
import VideoPlayer from './components/VideoPlayer'
import './App.css'

function App() {
  // Initialize from localStorage or default to true
  const [useFakeAd, setUseFakeAd] = useState(() => {
    const stored = localStorage.getItem('useFakeAd');
    return stored === null ? true : stored === 'true';
  });

  // Initialize xid from localStorage or default
  const [xid, setXid] = useState(() => {
    const stored = localStorage.getItem('xid');
    return stored || 'x8iio7y';
  });

  // Initialize customVmapUrl from localStorage or default
  const [customVmapUrl, setCustomVmapUrl] = useState(() => {
    const stored = localStorage.getItem('customVmapUrl');
    return stored || '';
  });

  // Using a sample HLS stream from a public source
  const hlsStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  useEffect(() => {
    localStorage.setItem('useFakeAd', useFakeAd.toString());
  }, [useFakeAd]);

  useEffect(() => {
    localStorage.setItem('xid', xid);
  }, [xid]);

  useEffect(() => {
    localStorage.setItem('customVmapUrl', customVmapUrl);
  }, [customVmapUrl]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setUseFakeAd(value);
    localStorage.setItem('useFakeAd', value.toString());
    window.location.reload();
  };

  const handleXidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXid(e.target.value);
  };

  const handleVmapUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomVmapUrl(e.target.value);
  };

  const handleApplySettings = () => {
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

        <div className="input-group">
          <label htmlFor="xid-input">
            Dailymotion Video ID (xid):
          </label>
          <input
            id="xid-input"
            type="text"
            value={xid}
            onChange={handleXidChange}
            placeholder="e.g., x8iio7y"
          />
        </div>

        <div className="input-group">
          <label htmlFor="vmap-input">
            Custom VMAP URL (optional):
          </label>
          <input
            id="vmap-input"
            type="text"
            value={customVmapUrl}
            onChange={handleVmapUrlChange}
            placeholder="Leave empty to use default"
          />
        </div>

        <button onClick={handleApplySettings} className="apply-button">
          Apply Settings
        </button>
      </div>
      <VideoPlayer
        src={hlsStreamUrl}
        useFakeAd={useFakeAd}
        xid={xid}
        customVmapUrl={customVmapUrl || undefined}
      />
    </div>
  )
}

export default App
