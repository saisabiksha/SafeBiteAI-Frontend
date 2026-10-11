import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AllergyProvider } from './context/AllergyContext';
import { AppLayout } from './components/layout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  FoodCheckerPage,
  ExposureAssistantPage,
  AllergiesPage,
  WellnessPage,
  RemindersPage,
  ProfilePage,
} from './pages';

export function App() {
  return (
    <AllergyProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes (Standalone Auth Shell) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard & Feature Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/food-checker" element={<FoodCheckerPage />} />
            <Route path="/exposure-assistant" element={<ExposureAssistantPage />} />
            <Route path="/allergies" element={<AllergiesPage />} />
            <Route path="/wellness" element={<WellnessPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AllergyProvider>
  );
}

export default App;
