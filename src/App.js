import './App.css';
import AppRoutes from './routes';
import { LocationProvider } from './contexts/LocationContext';
import InstallPrompt from './components/InstallPrompt';


function App() {
  return (
    <div className="font-inter tracking-wide">
      <InstallPrompt />
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </div>
  );
}

export default App;