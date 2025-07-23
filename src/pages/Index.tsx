import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Shield, Smartphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="p-6 border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SmartCare Mitra
              </h1>
              <p className="text-sm text-muted-foreground">Platform Mitra Terpercaya</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Masuk
            </Button>
            <Button 
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
            >
              Daftar Mitra
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            Bergabung dengan SmartCare
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Platform digital terdepan untuk mitra layanan. Kelola bisnis Anda dengan mudah, 
            tingkatkan pendapatan, dan jangkau lebih banyak pelanggan.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-lg px-8"
            >
              Mulai Sekarang
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Mengapa Memilih SmartCare Mitra?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-shadow">
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg w-fit">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Kelola Pelanggan</CardTitle>
                <CardDescription>
                  Sistem manajemen pelanggan terintegrasi untuk melacak pesanan dan preferensi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-shadow">
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg w-fit">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Keamanan Terjamin</CardTitle>
                <CardDescription>
                  Sistem pembayaran aman dengan verifikasi berlapis untuk melindungi transaksi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-shadow">
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg w-fit">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Akses Mobile</CardTitle>
                <CardDescription>
                  Dashboard responsif yang dapat diakses dari mana saja, kapan saja
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Siap Memulai Perjalanan Mitra?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Daftar sekarang dan rasakan kemudahan mengelola bisnis dengan SmartCare Mitra
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-lg px-12"
          >
            Daftar Sebagai Mitra
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-card border-t">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 SmartCare Mitra. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
