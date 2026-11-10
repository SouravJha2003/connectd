import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GameScreen } from './components/GameScreen.jsx';
import { SetupScreen } from './components/SetupScreen.jsx';
import { configFromSearch, configToSearch } from './navigation.js';
import './style.css';

function App() {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const onPopState = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
    });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(path) {
    window.history.pushState(null, '', path);
    setLocation({ pathname: window.location.pathname, search: window.location.search });
    window.scrollTo(0, 0);
  }

  const config = configFromSearch(location.search);

  if (location.pathname === '/game' && config) {
    return <GameScreen key={location.search} config={config}
      onReset={() => navigate(`/?${configToSearch(config)}`)} />;
  }

  return <SetupScreen key={location.search} initialConfig={location.pathname === '/' ? config : null}
    onStart={(nextConfig) => navigate(`/game?${configToSearch(nextConfig)}`)} />;
}

createRoot(document.getElementById('root')).render(<App />);
