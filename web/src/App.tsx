import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { WEB_PAGE } from "./constants/webPages";
import ProductListPage from "./pages/ProductListPage";
import MyProductsPage from "./pages/MyProductsPage";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/Signup";
import Profile from "./pages/Profile";
import HomePage from "./pages/HomePage/HomePage";
import CreateProduct from "./components/Product/CreateProduct";
import Logout from "./pages/Logout";
import ChangePassword from "./pages/ChangePassword";
import { UserProvider } from "./context/UserContext";
import { ProductDetail } from "./pages/ProductDetail/ProductDetail";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="p-6 text-white">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm text-white/70">Nội dung đang được cập nhật.</p>
  </div>
);

const AUTH_ROUTES = {
  SIGNIN: "/signin",
  SIGNUP: "/signup",
} as const;

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route element={<Layout />}>
              <Route path={WEB_PAGE.HOME.path} element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path={WEB_PAGE.CATEGORIES.path} element={<ProductListPage />} />
              <Route path={WEB_PAGE.FAVORITES.path} element={<PlaceholderPage title={WEB_PAGE.FAVORITES.label} />} />
              <Route path={WEB_PAGE.BID_HISTORY.path} element={<PlaceholderPage title={WEB_PAGE.BID_HISTORY.label} />} />
              <Route path={WEB_PAGE.MY_PRODUCTS.path} element={<MyProductsPage />} />
              <Route path={WEB_PAGE.CREATE_PRODUCT.path} element={<CreateProduct />} />
              <Route path={WEB_PAGE.PROFILE.path} element={<Profile />} />
              <Route path={WEB_PAGE.CHANGE_PASSWORD.path} element={<ChangePassword />} />
            </Route>
            <Route path={WEB_PAGE.LOGOUT.path} element={<Logout />} />
            <Route path={AUTH_ROUTES.SIGNIN} element={<SignInPage />} />
            <Route path={AUTH_ROUTES.SIGNUP} element={<SignUpPage />} />
            <Route path="*" element={<Navigate to={WEB_PAGE.HOME.path} replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
