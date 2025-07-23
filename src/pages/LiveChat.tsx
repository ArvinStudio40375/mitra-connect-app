import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, MessageSquare, User } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: string;
  receiver_id: string;
  receiver_type: string;
  message: string;
  created_at: string;
  read_by_sender: boolean;
  read_by_receiver: boolean;
}

const LiveChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUserEmail(currentUser.email);

    loadMessages();
    
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const userEmail = currentUser.email;

      if (!userEmail) return;

      // Load messages where current user is either sender or receiver
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .or(`and(sender_id.eq.${userEmail},sender_type.eq.mitra),and(receiver_id.eq.${userEmail},receiver_type.eq.mitra),and(sender_id.eq.admin,sender_type.eq.admin,receiver_id.eq.${userEmail}),and(receiver_id.eq.admin,receiver_type.eq.admin,sender_id.eq.${userEmail})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(data || []);
        
        // Mark messages as read by receiver if current user is receiver
        const unreadMessages = data?.filter(
          (msg) => 
            msg.receiver_id === userEmail && 
            msg.receiver_type === "mitra" && 
            !msg.read_by_receiver
        );

        if (unreadMessages && unreadMessages.length > 0) {
          await supabase
            .from("chat")
            .update({ read_by_receiver: true })
            .in("id", unreadMessages.map(msg => msg.id));
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const userEmail = currentUser.email;

      const { error } = await supabase
        .from("chat")
        .insert([
          {
            sender_id: userEmail,
            sender_type: "mitra",
            receiver_id: "admin",
            receiver_type: "admin",
            message: newMessage.trim(),
            read_by_sender: true,
            read_by_receiver: false
          }
        ]);

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Gagal mengirim pesan",
          variant: "destructive"
        });
      } else {
        setNewMessage("");
        loadMessages(); // Reload messages immediately after sending
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim pesan",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return messageDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach((message) => {
      const dateKey = new Date(message.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const isCurrentUser = (message: ChatMessage) => {
    return message.sender_id === currentUserEmail && message.sender_type === "mitra";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat chat...</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard-mitra")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Live Chat Admin</h1>
              <p className="text-sm text-muted-foreground">Hubungi tim support</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col shadow-[var(--shadow-card)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Admin Support
            </CardTitle>
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] p-4">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada pesan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mulai percakapan dengan mengirim pesan
                  </p>
                </div>
              ) : (
                Object.keys(groupedMessages).map((dateKey) => (
                  <div key={dateKey}>
                    {/* Date separator */}
                    <div className="text-center my-4">
                      <span className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
                        {formatDate(groupedMessages[dateKey][0].created_at)}
                      </span>
                    </div>
                    
                    {/* Messages for this date */}
                    {groupedMessages[dateKey].map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${
                          isCurrentUser(message) ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isCurrentUser(message)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser(message)
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground/70"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan Anda..."
                disabled={isSending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isSending || !newMessage.trim()}
                className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveChat;