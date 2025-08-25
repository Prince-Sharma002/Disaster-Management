import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Map from './components/Map';

function App() {
  return (
    <Router>
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Disaster Management System</h1>
                <a 
                  href="/map" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  Open Map
                </a>
              </div>
            </div>
          } />
          <Route path="/map" element={
            <div style={{ height: '100vh', width: '100%' }}>
              <Map />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
