// src/App.jsx
import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import Misiones from "./pages/Misiones";
import Jugar from "./pages/Jugar";
import Inicio from "./pages/Inicio.jsx";
import Aventuras from "./pages/Aventuras.jsx";
import Ejemplos from "./pages/Ejemplos.jsx";
import Niveles from "./pages/niveles.jsx"; 
import Auth from "./pages/Auth.jsx";
import Reset from "./pages/Reset.jsx";
import Profile from "./pages/Profile.jsx";
import Ayuda from "./pages/Ayuda.jsx";

const Page = ({ title }) => (
  <div className="p-6 text-xl font-semibold text-slate-100">{title}</div>
);

export default function App() {
  return (
    <AuthProvider>
      {/* Fondo global con estilo de juego */}
      <div className="fixed inset-0 -z-10">
        <img src="/assets/bg/main.jpg" alt="" className="h-full w-full object-cover" />
        {/* Velo colorido para estilo de juego */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-cyan-900/70 backdrop-blur-sm" />
        {/* Efectos de partÃ­culas decorativas */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-40 delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-50 delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-60 delay-500"></div>
        </div>
      </div>

      <TopNav />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/misiones" element={<Misiones />} />
        

        <Route path="/ejemplos" element={<Ejemplos />} /> {/* Verifica esta ruta */}

        <Route path="/niveles" element={<Niveles />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/aventuras" element={<Aventuras />} />
        <Route path="/jugar" element={<Jugar />} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
   
        
        {/* 404 fallback */}
        <Route path="*" element={<Page title="404 - No encontrado" />} />
      </Routes>
    </AuthProvider>
  );
}
