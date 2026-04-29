import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminUpload from "./pages/AdminUpload";
import NotFound from "./pages/NotFound";
import Decretos from "./pages/Decretos";
import DecretoDetalle from "./pages/DecretoDetalle";
import AdminDecretos from "./pages/AdminDecretos";
import { setSinVialTheme } from "./hooks/use-sinvial-theme";

const queryClient = new QueryClient();

const ThemeBootstrap = () => {
  useEffect(() => {
    const theme = window.localStorage.getItem("sinvial_theme") === "light" ? "light" : "dark";
    setSinVialTheme(theme);
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeBootstrap />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/mapa" element={<Index />} />
          <Route path="/decretos" element={<Decretos />} />
          <Route path="/decretos/:id" element={<DecretoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="/admin/decretos" element={<AdminDecretos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
