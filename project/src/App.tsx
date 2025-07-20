import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ApiService } from './services/ApiService';
import { ForecastData } from './types/ForecastTypes';

type ViewType = 'dashboard' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [selectedModel, setSelectedModel] = useState<'sarima' | 'lstm'>('sarima');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadForecastData();
  }, [selectedModel]);

  const loadForecastData = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getForecast(selectedModel);
      setForecastData(data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (model: 'sarima' | 'lstm') => {
    setSelectedModel(model);
  };

  const handleRetrain = async () => {
    setIsLoading(true);
    try {
      await ApiService.retrain();
      await loadForecastData();
    } catch (error) {
      console.error('Error retraining model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && (
            <Dashboard
              forecastData={forecastData}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              isLoading={isLoading}
            />
          )}
          {currentView === 'admin' && (
            <AdminPanel
              onRetrain={handleRetrain}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;