import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminQuotations } from "./pages/admin/AdminQuotations";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";

import { SellerDashboard } from "./pages/seller/SellerDashboard";

import { BuyerDashboard } from "./pages/buyer/BuyerDashboard";
import { BuyerProducts } from "./pages/buyer/BuyerProducts";
import { BuyerQuotations } from "./pages/buyer/BuyerQuotations";
import { BuyerOrders } from "./pages/buyer/BuyerOrders";

import { ProductsPage } from "./pages/shared/ProductsPage";
import { LandingPage } from "./pages/LandingPage";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const DashboardRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user?.role === "SELLER") return <Navigate to="/seller" replace />;
  return <Navigate to="/buyer" replace />;
};

function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-primary">403</h1>
                  <p className="text-muted-foreground mt-2">You don't have access to this page.</p>
                </div>
              </div>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="quotations" element={<AdminQuotations />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* Seller Routes */}
            <Route path="/seller" element={<ProtectedRoute allowedRoles={["SELLER"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SellerDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Buyer Routes */}
            <Route path="/buyer" element={<ProtectedRoute allowedRoles={["BUYER"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<BuyerDashboard />} />
              <Route path="products" element={<BuyerProducts />} />
              <Route path="quotations" element={<BuyerQuotations />} />
              <Route path="orders" element={<BuyerOrders />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
