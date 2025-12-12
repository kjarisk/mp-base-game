import Login from './components/Login';
import Lobby from './components/Lobby';
import Game from './components/Game';
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
      {currentPage === 'lobby' && <Lobby />}
      {currentPage === 'game' && <Game />}
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
