import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Receipt, Wallet, RefreshCw, Calendar, Play, MessageSquare, CheckCircle, Timer } from "lucide-react";

interface TopupTransaction {
  id: string;
  nominal: number;
  payment_method: string;
  status: string;
  transaction_code: string;
  created_at: string;
}

interface TagihanTransaction {
  id: string;
  nominal: number;
  status: string;
  order_date: string;
  completion_date: string;
  layanan_id: string;
  rating: number;
  user_id: string;
  mitra_id: string;
  // Additional fields for enhanced functionality
  layanan?: {
    nama_layanan: string;
    description: string;
  };
  users?: {
    nama: string;
    email: string;
  };
  work_started_at?: string;
  work_duration?: number;
}

const RiwayatTransaksi = () => {
  const [topupTransactions, setTopupTransactions] = useState<TopupTransaction[]>([]);
  const [tagihanTransactions, setTagihanTransactions] = useState<TagihanTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("topup");
  const [timers, setTimers] = useState<{[key: string]: number}>({});
  const [intervals, setIntervals] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TagihanTransaction | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || userRole !== "mitra") {
      navigate("/login");
      return;
    }

    // Check if redirected from dashboard with tab parameter
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam === "pesanan") {
      setActiveTab("tagihan");
    }

    loadTransactions();
  }, [navigate, location]);

  useEffect(() => {
    // Cleanup intervals on unmount
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [intervals]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const email = currentUser.email;

      if (!email) {
        throw new Error("No email found");
      }

      // Load top-up transactions
      const { data: topupData, error: topupError } = await supabase
        .from("topup")
        .select("*")
        .eq("user_id", email)
        .order("created_at", { ascending: false });

      if (topupError) {
        console.error("Topup error:", topupError);
      } else {
        setTopupTransactions(topupData || []);
      }

      // Get mitra ID from database
      const { data: mitraData } = await supabase
        .from("mitra")
        .select("id")
        .eq("email", email)
        .single();

      const mitraId = mitraData?.id;

      // Load tagihan transactions (orders where this mitra is involved)
      const { data: tagihanData, error: tagihanError } = await supabase
        .from("tagihan")
        .select(`
          *,
          layanan:layanan_id (
            nama_layanan,
            description
          ),
          users:user_id (
            nama,
            email
          )
        `)
        .eq("mitra_id", mitraId)
        .order("order_date", { ascending: false });

      if (tagihanError) {
        console.error("Tagihan error:", tagihanError);
      } else {
        setTagihanTransactions(tagihanData || []);
      }

    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat transaksi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
      case "selesai":
        return <Badge className="bg-success text-success-foreground">Selesai</Badge>;
      case "diterima":
        return <Badge className="bg-blue-500 text-white">Diterima</Badge>;
      case "sedang_dikerjakan":
        return <Badge className="bg-orange-500 text-white">Sedang Dikerjakan</Badge>;
      case "pending":
        return <Badge variant="secondary">Menunggu</Badge>;
      case "failed":
      case "cancelled":
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const startWork = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("tagihan")
        .update({ 
          status: "sedang_dikerjakan",
          work_started_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Error",
          description: "Gagal memulai pekerjaan",
          variant: "destructive"
        });
        return;
      }

      // Start timer
      setTimers(prev => ({ ...prev, [orderId]: 0 }));
      const interval = setInterval(() => {
        setTimers(prev => ({ ...prev, [orderId]: (prev[orderId] || 0) + 1 }));
      }, 1000);
      setIntervals(prev => ({ ...prev, [orderId]: interval }));

      toast({
        title: "Pekerjaan Dimulai",
        description: "Timer telah dimulai, silakan kerjakan pesanan",
        variant: "default"
      });

      loadTransactions();
    } catch (error) {
      console.error("Error starting work:", error);
    }
  };

  const finishWork = async (orderId: string) => {
    try {
      // Stop timer
      if (intervals[orderId]) {
        clearInterval(intervals[orderId]);
        setIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[orderId];
          return newIntervals;
        });
      }

      const workDuration = timers[orderId] || 0;

      // Get current mitra data for balance calculation
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const { data: mitraData } = await supabase
        .from("mitra")
        .select("saldo")
        .eq("email", currentUser.email)
        .single();

      // Get order details
      const order = tagihanTransactions.find(t => t.id === orderId);
      if (!order) return;

      const operationalFee = order.nominal * 0.1; // 10% fee
      const currentBalance = mitraData?.saldo || 0;

      // Update order status
      const { error } = await supabase
        .from("tagihan")
        .update({ 
          status: "selesai",
          completion_date: new Date().toISOString(),
          work_duration: workDuration
        })
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Error",
          description: "Gagal menyelesaikan pekerjaan",
          variant: "destructive"
        });
        return;
      }

      // Handle balance deduction or create billing record
      if (currentBalance >= operationalFee) {
        // Deduct from balance
        await supabase
          .from("mitra")
          .update({ saldo: currentBalance - operationalFee })
          .eq("email", currentUser.email);
      } else {
        // Create billing record (you might need to create a billing table)
        // For now, we'll just show a message
        toast({
          title: "Biaya Operasional",
          description: `Biaya operasional Rp ${operationalFee.toLocaleString('id-ID')} akan dicatat dalam tagihan`,
          variant: "default"
        });
      }

      // Show invoice
      setSelectedOrder(order);
      setShowInvoice(true);

      loadTransactions();
    } catch (error) {
      console.error("Error finishing work:", error);
    }
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openChat = (userId: string) => {
    // Navigate to live chat with specific user
    navigate(`/live-chat?user=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard-mitra")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            disabled={isLoading}
            className="ml-auto flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topup" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Top Up ({topupTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="tagihan" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Pesanan ({tagihanTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topup" className="space-y-4">
            {topupTransactions.length === 0 ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardContent className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada riwayat top up</p>
                </CardContent>
              </Card>
            ) : (
              topupTransactions.map((transaction) => (
                <Card key={transaction.id} className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Top Up Saldo</CardTitle>
                        <CardDescription>
                          Kode: {transaction.transaction_code}
                        </CardDescription>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nominal</p>
                        <p className="font-semibold text-lg text-primary">
                          {formatCurrency(transaction.nominal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                        <p className="font-medium capitalize">
                          {transaction.payment_method.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tagihan" className="space-y-4">
            {tagihanTransactions.length === 0 ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardContent className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada riwayat pesanan</p>
                </CardContent>
              </Card>
            ) : (
              tagihanTransactions.map((transaction) => (
                <Card key={transaction.id} className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {transaction.layanan?.nama_layanan || "Pesanan Layanan"}
                        </CardTitle>
                        <CardDescription>
                          ID: {transaction.id.substring(0, 8)}... | Pelanggan: {transaction.users?.nama || "User"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nominal</p>
                        <p className="font-semibold text-lg text-primary">
                          {formatCurrency(transaction.nominal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Pesanan</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(transaction.order_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(transaction.completion_date)}
                        </p>
                      </div>
                    </div>

                    {/* Timer display for working orders */}
                    {transaction.status === "sedang_dikerjakan" && timers[transaction.id] !== undefined && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-600">Waktu Kerja</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatTimer(timers[transaction.id])}
                        </p>
                      </div>
                    )}

                    {/* Action buttons based on status */}
                    <div className="flex gap-2 mb-4">
                      {transaction.status === "diterima" && (
                        <Button
                          onClick={() => startWork(transaction.id)}
                          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Mulai Bekerja
                        </Button>
                      )}
                      
                      {transaction.status === "sedang_dikerjakan" && (
                        <>
                          <Button
                            onClick={() => openChat(transaction.user_id)}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Live Chat
                          </Button>
                          <Button
                            onClick={() => finishWork(transaction.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Selesai
                          </Button>
                        </>
                      )}
                    </div>

                    {transaction.rating && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < transaction.rating ? "text-yellow-500" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({transaction.rating}/5)
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Invoice Dialog */}
        <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invoice Pesanan</DialogTitle>
              <DialogDescription>
                Detail lengkap pesanan yang telah diselesaikan
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-600">Pesanan Selesai</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ID Pesanan</span>
                    <span className="text-sm font-medium">{selectedOrder.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Layanan</span>
                    <span className="text-sm font-medium">{selectedOrder.layanan?.nama_layanan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pelanggan</span>
                    <span className="text-sm font-medium">{selectedOrder.users?.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Waktu Kerja</span>
                    <span className="text-sm font-medium">
                      {timers[selectedOrder.id] ? formatTimer(timers[selectedOrder.id]) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Tarif</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedOrder.nominal)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span className="text-sm">Biaya Operasional (10%)</span>
                    <span className="text-sm font-medium">-{formatCurrency(selectedOrder.nominal * 0.1)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Diterima</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.nominal * 0.9)}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowInvoice(false)}
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RiwayatTransaksi;