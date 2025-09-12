import React from "react"
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LookingForBlood from "./pages/LookingForBlood";
import WantToDonate from "./pages/WantToDonate";
// import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import RegisterDonor from "./pages/RegisterDonor";
import Login from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import Registration from "./pages/RegistrationPage";
import DonorPortalPage from "./pages/DonorPortalPage";
import ManageProfilePage from "./pages/ManageProfile";
import DonationCamps from "./pages/DonationCamps";
import BloodStockAvailability from "./pages/BloodStockAvailability";
import VerifyOtp from "./pages/VerifyOtp";
import ProtectedRoute from "./components/ProtectedRoute";
import UserMenu from "./components/UserMenu";
import UserBloodDashboard from "./pages/BloodBankDashboard";
import StaticPageLayout from "./components/ui/StaticPageLayout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Accessibility from "./pages/Accessibility";
import TermsConditions from "./pages/TermsConditions";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DonorRegister from "./pages/admin/DonorRegister";
import DonorCounseling from "./pages/admin/DonorCounseling";
import AdminCenters from "./pages/admin/AdminCenters";
import AdminAppointments from "./pages/admin/AdminAppointments";




const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/looking-for-blood" element={<LookingForBlood />} />
            <Route path="/want-to-donate" element={<WantToDonate />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/register-donor" element={<RegisterDonor />} />
            <Route path="/donor-portal" element={<DonorPortalPage />} />  
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/manage-profile" element={
                <ProtectedRoute>
                  <ManageProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/donation-camps" element={<DonationCamps />} />
            <Route path="/stock-availability" element={<BloodStockAvailability />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route path="/blood-bank-dashboard" element={<UserBloodDashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            //Admin
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="donors/register" element={<DonorRegister />} />
              <Route path="donors/counseling" element={<DonorCounseling />} />
              <Route path="centers" element={<AdminCenters />} />
              <Route path="appointments" element={<AdminAppointments />} />
          
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}