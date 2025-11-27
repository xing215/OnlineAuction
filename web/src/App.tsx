import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/Signup";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default: Signin */}
                <Route path="/" element={<Navigate to="/signin" replace />} />

                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
