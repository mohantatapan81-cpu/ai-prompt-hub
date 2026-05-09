import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Background } from "./components/Background";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Category } from "./pages/Category";
import { Contact } from "./pages/Contact";
import { About } from "./pages/About";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen text-white font-sans selection:bg-neon-pink/30">
        <Background />
        <Navbar />
        <div className="relative z-10 w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
