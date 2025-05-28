import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/Navbar";
import Home from "./assets/pages/Home";
import Contact from "./assets/pages/Contact";
import Services from "./assets/pages/Services";
import Login from "./assets/pages/Login";
import "./App.css";


function App() {
  return (
    <Router>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
        </Routes>
   
    </Router>
  );
}

export default App;