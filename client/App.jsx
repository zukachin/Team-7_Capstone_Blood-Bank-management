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
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import RegisterDonor from "./pages/RegisterDonor";
import Login from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import Registration from "./pages/RegistrationPage";
import DonorPortalPage from "./pages/DonorPortalPage";
import ManageProfilePage from "./pages/ManageProfile";


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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/register-donor" element={<RegisterDonor />} />
            <Route path="/donor-portal" element={<DonorPortalPage />} />  
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/manage-profile" element={<ManageProfilePage />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
