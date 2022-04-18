import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import CreateEnsemble from "./routes/create_ensemble";

function App() {
  return (
    <Routes>
      <Route path="/create_ensemble" element={<CreateEnsemble />} />
    </Routes>
  );
}

export default App;
