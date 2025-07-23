import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";

const StatusVerifikasi = () => {
  const [statusData, setStatusData] = useState({
    status: "pending",
    created_at: "",
    updated_at: ""
  });
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

    loadStatusData();
  }, [navigate]);

  const loadStatusData = async () => {
    setIsLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const email = currentUser.email;

      if (!email) {
        throw new Error("No email found");
      }

      // Get data from Supabase
      const { data, error } = await supabase
        .from("mitra")
        .select("status, created_at, updated_at")
        .eq("email", email)
        .single();

      if (data) {
        setStatusData({
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Error",
          description: "Gagal memuat status verifikasi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading status data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat status verifikasi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "terverifikasi":
        return {
          badge: <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Terverifikasi</Badge>,
          icon: <CheckCircle className="w-12 h-12 text-success" />,
          title: "Akun Terverifikasi",
          description: "Selamat! Akun mitra Anda telah berhasil diverifikasi. Anda sekarang dapat menggunakan semua fitur platform SmartCare Mitra.",
          color: "border-success bg-success/5"
        };
      case "pending":
        return {
          badge: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Verifikasi</Badge>,
          icon: <Clock className="w-12 h-12 text-warning" />,
          title: "Menunggu Verifikasi",
          description: "Akun Anda sedang dalam proses verifikasi. Tim kami akan meninjau informasi yang Anda berikan dan memberikan konfirmasi dalam 1-3 hari kerja.",
          color: "border-warning bg-warning/5"
        };
      case "ditolak":
        return {
          badge: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>,
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          title: "Verifikasi Ditolak",
          description: "Maaf, verifikasi akun Anda ditolak. Silakan periksa informasi yang Anda berikan dan hubungi tim support untuk informasi lebih lanjut.",
          color: "border-destructive bg-destructive/5"
        };
      default:
        return {
          badge: <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Status Tidak Diketahui</Badge>,
          icon: <AlertCircle className="w-12 h-12 text-muted-foreground" />,
          title: "Status Tidak Diketahui",
          description: "Status verifikasi tidak dapat ditentukan. Silakan hubungi tim support.",
          color: "border-muted bg-muted/5"
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = getStatusInfo(statusData.status);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat status verifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard-mitra")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Status Verifikasi</h1>
        </div>

        {/* Status Card */}
        <Card className={`shadow-[var(--shadow-card)] mb-6 ${statusInfo.color} border-2`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {statusInfo.icon}
            </div>
            <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
            <div className="flex justify-center">
              {statusInfo.badge}
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base leading-relaxed">
              {statusInfo.description}
            </CardDescription>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="shadow-[var(--shadow-card)] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Status</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStatusData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pendaftaran:</span>
                <span className="font-medium">{formatDate(statusData.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Terakhir Diperbarui:</span>
                <span className="font-medium">{formatDate(statusData.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Saat Ini:</span>
                <span className="font-medium capitalize">{statusData.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Butuh Bantuan?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Jika Anda memiliki pertanyaan tentang status verifikasi atau memerlukan bantuan, 
              jangan ragu untuk menghubungi tim support kami.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate("/live-chat")}
                className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
              >
                Chat dengan Admin
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/profil-mitra")}
              >
                Edit Profil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusVerifikasi;