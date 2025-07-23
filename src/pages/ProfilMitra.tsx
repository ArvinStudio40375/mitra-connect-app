import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const ProfilMitra = () => {
  const [formData, setFormData] = useState({
    nama_toko: "",
    email: "",
    alamat: "",
    phone_number: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

    loadProfilData();
  }, [navigate]);

  const loadProfilData = async () => {
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

      if (data) {
        setFormData({
          nama_toko: data.nama_toko || "",
          email: data.email || "",
          alamat: data.alamat || "",
          phone_number: data.phone_number || "",
          description: data.description || ""
        });
      } else {
        // Fallback to localStorage
        setFormData({
          nama_toko: currentUser.nama_toko || "",
          email: currentUser.email || "",
          alamat: currentUser.alamat || "",
          phone_number: currentUser.phone_number || "",
          description: ""
        });
      }
    } catch (error) {
      console.error("Error loading profil data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data profil",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update Supabase
      const { error } = await supabase
        .from("mitra")
        .update({
          nama_toko: formData.nama_toko,
          alamat: formData.alamat,
          phone_number: formData.phone_number,
          description: formData.description
        })
        .eq("email", formData.email);

      if (error) {
        console.error("Supabase error:", error);
      }

      // Update localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: any) => u.email === formData.email);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...formData };
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
      }

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
        variant: "default"
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">Profil Mitra</h1>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informasi Toko</CardTitle>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  Edit Profil
                </Button>
              )}
            </div>
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
                  disabled={!isEditing}
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
                  disabled={true}
                  className="w-full bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Nomor Telepon</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Toko (Opsional)</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="Ceritakan tentang toko Anda..."
                />
              </div>
              
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfilData(); // Reset form
                    }}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilMitra;