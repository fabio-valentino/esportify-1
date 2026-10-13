import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      {/* Sementara, sampai fitur Login dibuat */}
      <Route
        path="/login"
        element={<PlaceholderPage title="Halaman Login" />}
      />
    </Routes>
  );
}

export default App;
