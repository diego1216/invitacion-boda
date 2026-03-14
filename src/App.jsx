import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import Invitacion from "./pages/Invitacion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/invitacion/:id" element={<Invitacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;