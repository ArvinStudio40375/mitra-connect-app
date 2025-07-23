import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardMitra from "./pages/DashboardMitra";
import ProfilMitra from "./pages/ProfilMitra";
import StatusVerifikasi from "./pages/StatusVerifikasi";
import TopupSaldo from "./pages/TopupSaldo";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";
import LiveChat from "./pages/LiveChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard-mitra" element={<DashboardMitra />} />
          <Route path="/profil-mitra" element={<ProfilMitra />} />
          <Route path="/status-verifikasi" element={<StatusVerifikasi />} />
          <Route path="/topup-saldo" element={<TopupSaldo />} />
          <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
          <Route path="/live-chat" element={<LiveChat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
