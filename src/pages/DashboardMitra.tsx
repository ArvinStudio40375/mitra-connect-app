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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Selamat datang, {mitraData?.nama_toko}!
                  </CardTitle>
                  <CardDescription>
                    Dashboard SmartCare Mitra
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(mitraData?.status || "pending")}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="font-semibold text-primary">
                    Rp {mitraData?.saldo?.toLocaleString('id-ID') || "0"}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-105"
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto p-4 w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <Card className="mt-6 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mitraData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                <p className="font-medium">{mitraData?.phone_number}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p className="font-medium">{mitraData?.alamat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMitra;