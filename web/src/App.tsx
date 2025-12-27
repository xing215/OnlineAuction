import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import { WEB_PAGE } from "./constants/webPages";
import ProductListPage from "./pages/ProductListPage";
import MyProductsPage from "./pages/MyProductsPage";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import HomePage from "./pages/HomePage/HomePage";
import CreateProduct from "./components/Product/CreateProduct";
import Logout from "./pages/Logout";
import ChangePassword from "./pages/ChangePassword";
import { UserProvider } from "./context/UserContext";
import { ProductDetail } from "./pages/ProductDetail/ProductDetail";
import FavList from "./pages/FavList";
import ManageUser from "./pages/Admin/ManageUser";
import ProductManagement from "./pages/Admin/ProductManagement";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import UpgradeRequest from "./pages/Admin/UpgradeRequest";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderManagement from "./pages/OrderManagement";

const AUTH_ROUTES = {
    SIGNIN: "/signin",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
} as const;

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#363636",
                            color: "#fff",
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: "#4ade80",
                                secondary: "#fff",
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: "#ef4444",
                                secondary: "#fff",
                            },
                        },
                    }}
                />
                <div className="app-container">
                    <Routes>
                        <Route element={<Layout />}>
                            <Route
                                path={WEB_PAGE.HOME.path}
                                element={<HomePage />}
                            />
                            <Route
                                path="/product/:id"
                                element={<ProductDetail />}
                            />
                            <Route
                                path={WEB_PAGE.CATEGORIES.path}
                                element={<ProductListPage />}
                            />
                            <Route
                                path={WEB_PAGE.FAVORITES.path}
                                element={<FavList />}
                            />
                            <Route
                                path={WEB_PAGE.MY_PRODUCTS.path}
                                element={<MyProductsPage />}
                            />
                            <Route
                                path={WEB_PAGE.CREATE_PRODUCT.path}
                                element={<CreateProduct />}
                            />
                            <Route
                                path={WEB_PAGE.PROFILE.path}
                                element={<Profile />}
                            />
                            <Route
                                path={WEB_PAGE.CHANGE_PASSWORD.path}
                                element={<ChangePassword />}
                            />
                            <Route 
                                path={WEB_PAGE.ORDER.path}
                                element={<OrderManagement />} 
                            />
                            <Route 
                                path="/orders/:orderId" 
                                element={<OrderDetailPage />} 
                            />
                        </Route>
                        <Route
                            path={WEB_PAGE.LOGOUT.path}
                            element={<Logout />}
                        />
                        <Route
                            path={AUTH_ROUTES.SIGNIN}
                            element={<SignInPage />}
                        />
                        <Route
                            path={AUTH_ROUTES.SIGNUP}
                            element={<SignUpPage />}
                        />
                        <Route
                            path={AUTH_ROUTES.FORGOT_PASSWORD}
                            element={<ForgotPasswordPage />}
                        />
                        {/* Admin */}
                        <Route
                            path="/admin/manage-user"
                            element={<ManageUser />}
                        />
                        <Route
                            path="/admin/manage-product"
                            element={<ProductManagement />}
                        />
                        <Route
                            path="/admin/manage-category"
                            element={<CategoryManagement />}
                        />
                        <Route
                            path="/admin/upgrade-requests"
                            element={<UpgradeRequest />}
                        />
                        <Route
                            path="*"
                            element={
                                <Navigate to={WEB_PAGE.HOME.path} replace />
                            }
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;
