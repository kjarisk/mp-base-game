import Login from './components/Login';
import ModeSelect from './components/ModeSelect';
import Lobby from './components/Lobby';
import Game from './components/Game';
import SinglePlayerGame from './components/SinglePlayerGame';
import Achievements from './components/Achievements';
import { AppProvider, useAppContext } from './context/AppContext';
import './App.css';

function AppContent() {
  const { currentPage, loading } = useAppContext();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === 'login' && <Login />}
      {currentPage === 'mode-select' && <ModeSelect />}
      {currentPage === 'lobby' && <Lobby />}
      {currentPage === 'game' && <Game />}
      {currentPage === 'single-player' && <SinglePlayerGame />}
      {currentPage === 'achievements' && <Achievements />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
