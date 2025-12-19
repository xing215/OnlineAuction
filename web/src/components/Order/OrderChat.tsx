import React, { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { apiUrl } from "../../config/api";

interface OrderChatProps {
  orderId: string;
  currentUser: any;
  token: string | null;
}

const OrderChat: React.FC<OrderChatProps> = ({
  orderId,
  currentUser,
  token,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(apiUrl(`api/orders/${orderId}/chat`), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  };

  // Polling 3s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch(apiUrl(`api/orders/${orderId}/chat`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: input }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        setInput("");
      }
    } catch (err) {
      alert("Lỗi gửi tin nhắn");
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-yellow-500 p-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">
              Hộp thoại đơn hàng
            </h3>
            <p className="text-xs text-yellow-50 opacity-90">
              Trao đổi trực tiếp
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Chưa có tin nhắn.</p>
        )}

        {messages.map((msg, idx) => {
          const senderId =
            typeof msg.sender === "object" ? msg.sender._id : msg.sender;
          const isMe =
            senderId === currentUser.id || senderId === currentUser._id;

          return (
            <div
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-yellow-500 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 placeholder-gray-500"
        />
        <button
          type="submit"
          className="p-3 bg-gray-900 hover:bg-gray-800 text-yellow-500 rounded-full shadow-lg"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default OrderChat;
