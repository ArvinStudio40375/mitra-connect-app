import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, MapPin } from "lucide-react";

interface IncomingOrder {
  id: string;
  user_id: string;
  layanan_id: string;
  nominal: number;
  status: string;
  order_date: string;
  // Add service name and user details
  layanan?: {
    nama_layanan: string;
    description: string;
  };
  user?: {
    nama: string;
    email: string;
  };
}

const IncomingOrders = () => {
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadIncomingOrders();
    
    // Set up polling for new orders every 30 seconds
    const interval = setInterval(loadIncomingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIncomingOrders = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const mitraEmail = currentUser.email;

      if (!mitraEmail) {
        console.log("No mitra email found");
        return;
      }

      console.log("Loading incoming orders for:", mitraEmail);

      // Get orders that are pending and need mitra assignment
      const { data, error } = await supabase
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
        .eq("status", "pending")
        .is("mitra_id", null)
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        console.error("Error details:", error);
        return;
      }

      console.log("Orders loaded:", data);
      setOrders(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const mitraEmail = currentUser.email;

      if (!mitraEmail) {
        toast({
          title: "Error",
          description: "Data mitra tidak ditemukan",
          variant: "destructive"
        });
        return;
      }

      // Get mitra data from database
      const { data: mitraData, error: mitraError } = await supabase
        .from("mitra")
        .select("id")
        .eq("email", mitraEmail)
        .single();

      if (mitraError || !mitraData) {
        toast({
          title: "Error", 
          description: "Data mitra tidak ditemukan di database",
          variant: "destructive"
        });
        return;
      }

      // Update order with mitra_id and change status to "diterima"
      const { error } = await supabase
        .from("tagihan")
        .update({ 
          mitra_id: mitraData.id,
          status: "diterima"
        })
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Error",
          description: "Gagal menerima pesanan",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Pesanan Diterima",
        description: "Pesanan berhasil diterima dan dialihkan ke riwayat transaksi",
        variant: "default"
      });

      // Remove order from list
      setOrders(orders.filter(order => order.id !== orderId));

      // Redirect to riwayat transaksi with pesanan tab active
      navigate("/riwayat-transaksi?tab=pesanan");

    } catch (error) {
      console.error("Error accepting order:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menerima pesanan",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Tidak ada pesanan masuk saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {order.layanan?.nama_layanan || "Layanan"}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {order.id.substring(0, 8)}...
                </p>
              </div>
              <Badge className="bg-orange-500 text-white">
                Pesanan Baru
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Pelanggan</span>
                </div>
                <p className="font-medium text-gray-800">
                  {order.user?.nama || "User"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Waktu</span>
                </div>
                <p className="font-medium text-gray-800">
                  {formatDate(order.order_date)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Total</span>
                <p className="font-bold text-lg text-orange-600">
                  {formatCurrency(order.nominal)}
                </p>
              </div>
              <Button
                onClick={() => acceptOrder(order.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Terima Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IncomingOrders;