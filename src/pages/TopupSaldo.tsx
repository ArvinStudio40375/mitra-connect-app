import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Wallet, CreditCard } from "lucide-react";

const TopupSaldo = () => {
  const [nominal, setNominal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSaldo, setCurrentSaldo] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000];
  const paymentMethods = [
    { value: "bank_transfer", label: "Transfer Bank" },
    { value: "e_wallet", label: "E-Wallet (GoPay, OVO, DANA)" },
    { value: "virtual_account", label: "Virtual Account" },
    { value: "credit_card", label: "Kartu Kredit" }
  ];

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || userRole !== "mitra") {
      navigate("/login");
      return;
    }

    loadCurrentSaldo();
  }, [navigate]);

  const loadCurrentSaldo = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const email = currentUser.email;

      if (!email) return;

      // Get current saldo from Supabase
      const { data, error } = await supabase
        .from("mitra")
        .select("saldo")
        .eq("email", email)
        .single();

      if (data) {
        setCurrentSaldo(data.saldo || 0);
      }
    } catch (error) {
      console.error("Error loading saldo:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nominal || !paymentMethod) {
      toast({
        title: "Error",
        description: "Silakan lengkapi semua field",
        variant: "destructive"
      });
      return;
    }

    const nominalNumber = parseInt(nominal);
    if (nominalNumber < 10000) {
      toast({
        title: "Error",
        description: "Nominal minimal Rp 10.000",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const email = currentUser.email;

      // Generate transaction code
      const transactionCode = `TOP${Date.now()}`;

      // Save to Supabase topup table
      const { error } = await supabase
        .from("topup")
        .insert([
          {
            user_id: currentUser.id || email, // Use email as fallback if no id
            nominal: nominalNumber,
            payment_method: paymentMethod,
            status: "pending",
            transaction_code: transactionCode
          }
        ]);

      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Error",
          description: "Gagal mengirim permintaan top up",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Berhasil",
        description: `Permintaan top up sebesar Rp ${nominalNumber.toLocaleString('id-ID')} berhasil dikirim. Kode transaksi: ${transactionCode}`,
        variant: "default"
      });

      // Reset form
      setNominal("");
      setPaymentMethod("");
    } catch (error) {
      console.error("Top up error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses top up",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredefinedAmount = (amount: number) => {
    setNominal(amount.toString());
  };

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
          <h1 className="text-2xl font-bold text-foreground">Top Up Saldo</h1>
        </div>

        {/* Current Balance */}
        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Saldo Saat Ini</CardTitle>
                <CardDescription>Saldo aktif di akun Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              Rp {currentSaldo.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        {/* Top Up Form */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Isi Ulang Saldo
            </CardTitle>
            <CardDescription>
              Pilih nominal dan metode pembayaran untuk top up saldo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Predefined Amounts */}
              <div className="space-y-3">
                <Label>Pilih Nominal Cepat</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      onClick={() => handlePredefinedAmount(amount)}
                      className="h-12"
                    >
                      Rp {amount.toLocaleString('id-ID')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="nominal">Atau Masukkan Nominal Manual</Label>
                <Input
                  id="nominal"
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Minimal Rp 10.000"
                  min="10000"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimal top up Rp 10.000
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : `Top Up ${nominal ? `Rp ${parseInt(nominal || "0").toLocaleString('id-ID')}` : "Saldo"}`}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Informasi Penting:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Permintaan top up akan diproses dalam 1-24 jam</li>
                <li>• Anda akan menerima konfirmasi setelah pembayaran diverifikasi</li>
                <li>• Saldo akan otomatis bertambah setelah konfirmasi</li>
                <li>• Simpan kode transaksi untuk referensi</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopupSaldo;