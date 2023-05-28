import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/layout/Header/Header";
import Footer from "./component/layout/Footer/Footer";
import Home from "./component/Home/Home.js";

function App() {
  return (
    <Router>
      <>
        {/* <h1>Hello React</h1> */}
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<h1>About</h1>} />
        </Routes>
        {/* <main style={{ minHeight: "80vh" }}></main> */}
        <Footer />
      </>
    </Router>
  );
}

export default App;
