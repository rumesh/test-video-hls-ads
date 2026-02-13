import { useState, useEffect, useRef } from 'react'
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
    return stored;
  });

  // Initialize customVmapUrl from localStorage or default
  const [customVmapUrl, setCustomVmapUrl] = useState(() => {
    const stored = localStorage.getItem('customVmapUrl');
    return stored || '';
  });

  const [isSticky, setIsSticky] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerHeight, setPlayerHeight] = useState(0);

  // Using a sample HLS stream from a public source
  const hlsStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  useEffect(() => {
    localStorage.setItem('useFakeAd', useFakeAd.toString());
  }, [useFakeAd]);

  useEffect(() => {
    if (xid !== null) {
      localStorage.setItem('xid', xid);
    }
  }, [xid]);

  useEffect(() => {
    localStorage.setItem('customVmapUrl', customVmapUrl);
  }, [customVmapUrl]);

  // Sticky player logic
  useEffect(() => {
    const handleScroll = () => {
      if (!playerContainerRef.current) return;

      const rect = playerContainerRef.current.getBoundingClientRect();
      const playerTop = rect.top;

      // Capture the original height before making sticky
      if (playerTop <= 0 && !isSticky) {
        setPlayerHeight(rect.height);
        setIsSticky(true);
      } else if (playerTop > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setUseFakeAd(value);
    localStorage.setItem('useFakeAd', value.toString());
    window.location.reload();
  };

  const handleXidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newXid = e.target.value;
    setXid(newXid);
    // Auto-disable fake ads when xid is changed from default
    if (newXid && useFakeAd) {
      setUseFakeAd(false);
    }
  };

  const handleVmapUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVmapUrl = e.target.value;
    setCustomVmapUrl(newVmapUrl);
    // Auto-disable fake ads when custom VMAP URL is provided
    if (newVmapUrl && useFakeAd) {
      setUseFakeAd(false);
    }
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
            value={xid || ''}
            onChange={handleXidChange}
            placeholder="Enter Dailymotion video ID (e.g., x8iio7y)"
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

      <div
        ref={playerContainerRef}
        className={`player-wrapper ${isSticky ? 'sticky' : ''}`}
        style={isSticky ? { height: `${playerHeight}px` } : undefined}
      >
        <div className={isSticky ? 'player-content-sticky' : ''}>
          <VideoPlayer
            src={hlsStreamUrl}
            useFakeAd={useFakeAd}
            xid={xid || undefined}
            customVmapUrl={customVmapUrl || undefined}
          />
        </div>
      </div>

      <div className="content-section">
        <h2>About This Demo</h2>
        <p>
          This is a demonstration of an HLS video player with integrated ad support.
          The player supports preroll, midroll, and postroll ads using the Dailymotion Ad SDK.
          Scroll down to see the sticky player in action!
        </p>

        <h2>Lorem Ipsum Content</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>

        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
          voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
          illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>

        <h3>Features</h3>
        <ul>
          <li>HLS streaming support with hls.js</li>
          <li>Integrated Dailymotion Ad SDK</li>
          <li>Preroll, midroll, and postroll ad support</li>
          <li>Autoplay policy compliance</li>
          <li>Dark mode support</li>
          <li>Sticky player on scroll</li>
          <li>WCAG accessibility compliant</li>
        </ul>

        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
          quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
          voluptatem.
        </p>

        <h3>How to Use</h3>
        <p>
          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,
          nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum
          fugiat quo voluptas nulla pariatur?
        </p>

        <p>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
          voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
          occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia
          animi, id est laborum et dolorum fuga.
        </p>

        <h3>Technical Details</h3>
        <p>
          Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta
          nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere
          possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        </p>

        <p>
          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
          ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic
          tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur
          aut perferendis doloribus asperiores repellat.
        </p>

        <h2>More Content</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>

        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>

        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
          architecto beatae vitae dicta sunt explicabo.
        </p>

        <h3>Final Section</h3>
        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
          quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
        </p>

        <p>
          Thank you for testing this video player demo! The sticky player should now be visible
          in the bottom-right corner of your screen.
        </p>
      </div>
    </div>
  )
}

export default App
