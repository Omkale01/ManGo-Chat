import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/protectedRoute';
import Loader from './components/loader';
import { useSelector } from 'react-redux';

function App() {
  const { loader } = useSelector(state => state.loaderReducer);
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        {loader && <Loader />}
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </>
    );
}

export default App;