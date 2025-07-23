import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Receipt, Wallet, RefreshCw, Calendar } from "lucide-react";

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
}

const RiwayatTransaksi = () => {
  const [topupTransactions, setTopupTransactions] = useState<TopupTransaction[]>([]);
  const [tagihanTransactions, setTagihanTransactions] = useState<TagihanTransaction[]>([]);
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

    loadTransactions();
  }, [navigate]);

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

      // Load tagihan transactions (orders where this mitra is involved)
      const { data: tagihanData, error: tagihanError } = await supabase
        .from("tagihan")
        .select("*")
        .eq("mitra_id", currentUser.id || email)
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
        return <Badge className="bg-success text-success-foreground">Berhasil</Badge>;
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

        <Tabs defaultValue="topup" className="w-full">
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
                        <CardTitle className="text-lg">Pesanan Layanan</CardTitle>
                        <CardDescription>
                          ID: {transaction.id.substring(0, 8)}...
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
      </div>
    </div>
  );
};

export default RiwayatTransaksi;