import './App.css';
import AppRoutes from './routes';
import { LocationProvider } from './contexts/LocationContext';

function App() {
  return (
    <div className="font-inter tracking-wide">
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </div>
  );
}

export default App;