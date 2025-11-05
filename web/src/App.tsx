import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ModelBuilder from './pages/ModelBuilder';
import DynamicData from './pages/DynamicData';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Layout />}>
          <Route path="model-builder" element={<ModelBuilder />} />
          <Route path="data/:modelName" element={<DynamicData />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
