import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GameScreen } from './components/GameScreen.jsx';
import { SetupScreen } from './components/SetupScreen.jsx';
import { configFromSearch, configToSearch } from './navigation.js';
import './style.css';

function App() {
  const [route, setRoute] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(nextRoute) {
    window.location.hash = nextRoute;
    setRoute(window.location.hash);
    window.scrollTo(0, 0);
  }

  const [pathname, search = ''] = route.slice(1).split('?');
  const config = configFromSearch(search);

  if (pathname === '/game' && config) {
    return <GameScreen key={search} config={config}
      onReset={() => navigate(`/?${configToSearch(config)}`)} />;
  }

  return <SetupScreen key={search} initialConfig={pathname === '/' ? config : null}
    onStart={(nextConfig) => navigate(`/game?${configToSearch(nextConfig)}`)} />;
}

createRoot(document.getElementById('root')).render(<App />);
