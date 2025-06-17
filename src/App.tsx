import VideoPlayer from './components/VideoPlayer'
import './App.css'

function App() {
  // Using a sample HLS stream from a public source
  const hlsStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  return (
    <div className="app">
      <h1>HLS Video Player Demo</h1>
      <VideoPlayer src={hlsStreamUrl} />
    </div>
  )
}

export default App
