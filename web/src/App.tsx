import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProductListPage from "./pages/ProductListPage";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/Signup";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="p-6 text-white">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm text-white/70">Nội dung đang được cập nhật.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/categories" element={<PlaceholderPage title="Danh mục" />} />
          <Route path="/favorites" element={<PlaceholderPage title="Yêu thích" />} />
          <Route path="/bid-history" element={<PlaceholderPage title="Lịch sử đấu giá" />} />
          <Route path="/my-products" element={<PlaceholderPage title="Sản phẩm của tôi" />} />
          <Route path="/profile" element={<PlaceholderPage title="Hồ sơ" />} />
          <Route path="/settings" element={<PlaceholderPage title="Cài đặt" />} />
          <Route path="/logout" element={<Navigate to="/signin" replace />} />
        </Route>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
