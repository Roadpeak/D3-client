import './App.css';
import AppRoutes from './routes';
import { LocationProvider } from './contexts/LocationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <DarkModeProvider>
      <LocationProvider>
        <div className="font-inter tracking-wide bg-white dark:bg-gray-900 transition-colors duration-200">
          <InstallPrompt />
          <AppRoutes />
        </div>
      </LocationProvider>
    </DarkModeProvider>
  );
}

export default App;