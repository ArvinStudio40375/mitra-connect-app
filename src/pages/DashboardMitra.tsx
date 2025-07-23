import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Wallet, 
  Receipt, 
  MessageSquare, 
  LogOut,
  Store,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface MitraData {
  nama_toko: string;
  email: string;
  alamat: string;
  phone_number: string;
  status: string;
  saldo: number;
}

const DashboardMitra = () => {
  const [mitraData, setMitraData] = useState<MitraData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || userRole !== "mitra") {
      navigate("/login");
      return;
    }

    loadMitraData();
  }, [navigate]);

  const loadMitraData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const email = currentUser.email;

      if (!email) {
        throw new Error("No email found");
      }

      // Try to get data from Supabase first
      const { data, error } = await supabase
        .from("mitra")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error:", error);
      }

      // Use Supabase data if available, otherwise use localStorage
      if (data) {
        setMitraData({
          nama_toko: data.nama_toko,
          email: data.email,
          alamat: data.alamat,
          phone_number: data.phone_number,
          status: data.status,
          saldo: data.saldo || 0
        });
      } else {
        // Fallback to localStorage
        setMitraData({
          nama_toko: currentUser.nama_toko,
          email: currentUser.email,
          alamat: currentUser.alamat,
          phone_number: currentUser.phone_number,
          status: "pending",
          saldo: 0
        });
      }
    } catch (error) {
      console.error("Error loading mitra data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data mitra",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    
    toast({
      title: "Logout Berhasil",
      description: "Anda telah berhasil keluar dari sistem",
      variant: "default"
    });

    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terverifikasi":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case "ditolak":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const menuItems = [
    {
      title: "Profil Mitra",
      description: "Kelola informasi toko Anda",
      icon: User,
      path: "/profil-mitra",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Status Verifikasi",
      description: "Cek status verifikasi akun",
      icon: Shield,
      path: "/status-verifikasi",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Top Up Saldo",
      description: "Isi ulang saldo akun",
      icon: Wallet,
      path: "/topup-saldo",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Riwayat Transaksi",
      description: "Lihat riwayat transaksi",
      icon: Receipt,
      path: "/riwayat-transaksi",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Live Chat Admin",
      description: "Hubungi tim support",
      icon: MessageSquare,
      path: "/live-chat",
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Logout",
      description: "Keluar dari akun",
      icon: LogOut,
      action: handleLogout,
      color: "from-red-500 to-red-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-gray-800">SmartCare</span>
        </div>
        <div className="flex-1 mx-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari layanan..." 
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-4 py-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saldo Anda</p>
                  <p className="font-bold text-lg">Rp {mitraData?.saldo?.toLocaleString('id-ID') || "0"}</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(mitraData?.status || "pending")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 mb-6">
        <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Selamat Datang!</h3>
                <p className="text-sm opacity-90">{mitraData?.nama_toko}</p>
                <p className="text-xs opacity-80 mt-1">Dashboard SmartCare Mitra</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Grid */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {menuItems.slice(0, 4).map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-2`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-center font-medium text-gray-700 leading-tight">
                {item.title.replace(' ', '\n')}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {menuItems.slice(4).map((item, index) => (
            <div 
              key={index + 4}
              className="bg-white rounded-2xl p-4 flex items-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mr-3`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Marketplace */}
      <div className="bg-white rounded-t-3xl px-4 py-6 mt-4">
        <h2 className="font-bold text-lg text-gray-800 mb-2">Informasi Akun</h2>
        <p className="text-sm text-gray-600 mb-4">Data lengkap mitra terdaftar</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-800">{mitraData?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Nomor Telepon</span>
            <span className="text-sm font-medium text-gray-800">{mitraData?.phone_number}</span>
          </div>
          <div className="py-2">
            <span className="text-sm text-gray-600">Alamat</span>
            <p className="text-sm font-medium text-gray-800 mt-1">{mitraData?.alamat}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;