import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    nama_toko: "",
    email: "",
    password: "",
    confirmPassword: "",
    alamat: "",
    phone_number: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      if (existingUsers.find((user: any) => user.email === formData.email)) {
        toast({
          title: "Error",
          description: "Email sudah digunakan",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Save to localStorage
      const newUser = {
        nama_toko: formData.nama_toko,
        email: formData.email,
        password: formData.password,
        alamat: formData.alamat,
        phone_number: formData.phone_number,
        role: "mitra",
        id: Date.now().toString()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));

      // Save to Supabase
      const { error } = await supabase
        .from("mitra")
        .insert([
          {
            nama_toko: formData.nama_toko,
            email: formData.email,
            alamat: formData.alamat,
            phone_number: formData.phone_number,
            status: "pending"
          }
        ]);

      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Warning",
          description: "Data berhasil disimpan secara lokal, tapi gagal sinkronisasi dengan server",
          variant: "destructive"
        });
      }

      toast({
        title: "Berhasil",
        description: "Pendaftaran berhasil! Silakan login",
        variant: "default"
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-card)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SmartCare Mitra
          </CardTitle>
          <CardDescription>
            Daftar sebagai mitra untuk bergabung dengan platform kami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_toko">Nama Toko</Label>
              <Input
                id="nama_toko"
                name="nama_toko"
                type="text"
                value={formData.nama_toko}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor Telepon</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                name="alamat"
                type="text"
                value={formData.alamat}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:text-primary-glow font-medium"
              >
                Login di sini
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;