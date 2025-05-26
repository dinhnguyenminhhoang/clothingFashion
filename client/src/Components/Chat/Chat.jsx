import {
  LoadingOutlined,
  MessageOutlined,
  SendOutlined,
  XFilled,
} from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const Chat = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [secctionId, setSecctioonId] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    setError("");
  };
  useEffect(() => {
    if (!secctionId) {
      const storedSectionId = localStorage.getItem("sectionId");
      if (storedSectionId) {
        setSecctioonId(storedSectionId);
      } else {
        const newSectionId = Date.now();
        setSecctioonId(newSectionId);
        localStorage.setItem("sectionId", newSectionId);
      }
    }
  }, []);
  const chatWithN8N = async (message) => {
    try {
      const response = await axios.post(
        "https://primary-production-94167.up.railway.app/webhook/ed8608eb-6329-4c49-86b3-da5d1ab4b488",
        { message: message, secctionId: secctionId }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error calling n8n webhook:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() === "") {
      setError("Vui lòng nhập tin nhắn!");
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentMessage = messageText;
    setMessageText("");

    try {
      const response = await chatWithN8N(currentMessage);

      // Extract response text - adjust this based on your n8n webhook response structure
      let botResponseText = "";
      if (typeof response === "string") {
        botResponseText = response;
      } else if (response.message) {
        botResponseText = response.message;
      } else if (response.text) {
        botResponseText = response.text;
      } else if (response.response) {
        botResponseText = response.response;
      } else {
        botResponseText = "Đã nhận được phản hồi từ bot";
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      setError("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại!");
      console.error("Chat error:", error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi không thể phản hồi lúc này. Vui lòng thử lại sau.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isChatVisible && (
        <div className="bg-white shadow-2xl rounded-lg w-96 h-[600px] flex flex-col relative border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">Chat với Bot</h3>
            <button
              onClick={() => setIsChatVisible(false)}
              className="hover:bg-blue-600 p-1 rounded-full transition-colors"
            >
              <XFilled size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "bot" ? "justify-start" : "justify-end"
                } mb-4`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg break-words ${
                    msg.sender === "bot"
                      ? "bg-white text-gray-800 shadow-sm border"
                      : "bg-blue-500 text-white"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                ></div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-2">
                  <LoadingOutlined
                    size={16}
                    className="animate-spin text-blue-500"
                  />
                  <span className="text-gray-600">Đang nhập...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || messageText.trim() === ""}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[50px]"
              >
                {loading ? (
                  <LoadingOutlined size={16} className="animate-spin" />
                ) : (
                  <SendOutlined size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isChatVisible && (
        <button
          onClick={toggleChat}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageOutlined size={24} />
        </button>
      )}
    </div>
  );
};

export default Chat;
