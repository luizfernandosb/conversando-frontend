import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { useEffect, useState, useRef } from "react";

export default function Chat() {
  const [messageList, setMessageList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [message, setMessage] = useState("");
  const [isSpam, setIsSpam] = useState(false);
  const [spamCountdown, setSpamCountdown] = useState(0);
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollDisabled, setScrollDisabled] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const fetchMessages = () => {
    axios
      .get("https://conversando-backend.onrender.com/api/message", {
        headers: {
            'Content-Type': 'application/json'
        }
      })
       
      .then((response) => {
        const messages = response.data;
        setMessageList(messages);
        
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    axios
      .get("https://conversando-backend.onrender.com/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const userLoggedName = response.data.user.name;
        setUserData(userLoggedName);

      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  const checkIfAtBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
      const atBottom = scrollHeight - clientHeight <= scrollTop + 1;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);
      if (!atBottom) {
        setScrollDisabled(true);
      } else {
        setScrollDisabled(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!scrollDisabled && isAtBottom) {
      scrollToBottom();
    }
  }, [messageList, isAtBottom, scrollDisabled]);

  useEffect(() => {
    if (spamCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setSpamCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else {
      setIsSpam(false);
    }
  }, [spamCountdown]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (isSpam) return;

    axios
      .post(
        "https://conversando-backend.onrender.com/api/message",
        { content: message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const newMessage = response.data.message;
        setMessageList((prevMessages) => [...prevMessages, newMessage]);
        setMessage("");
        setIsSpam(true);
        setSpamCountdown(5);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage(event);
    }
  };

  const handleScrollToBottomClick = () => {
    setIsAtBottom(true);
    setShowScrollButton(false);
    setScrollDisabled(false);
    scrollToBottom();
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md h-full w-full max-w-full lg:w-full flex flex-col justify-between sm:p-6">
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between shadow-lg z-10">
        <div className="text-white text-3xl font-extrabold tracking-wide flex items-center space-x-2">
          <span className="text-yellow-400">Conversando</span>
          <span>App</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
      <div
        ref={chatContainerRef}
        className="space-y-6 overflow-y-auto mb-4 flex-grow pt-20 mb-10"
        onScroll={checkIfAtBottom}
      >
        {messageList.map((message) => (
          <div
            className={
              message.sender.name === userData
                ? "flex flex-col items-end"
                : "flex flex-col items-start"
            }
            key={message.id}
          >
            <span className="text-sm text-gray-600">{message.sender.name}</span>
            <div
              className={
                message.sender.name === userData
                  ? "bg-blue-500 text-white p-3 rounded-lg max-w-xs shadow-md break-words"
                  : "bg-gray-300 text-gray-800 p-3 rounded-lg max-w-xs shadow-md break-words"
              }
            >
              {message.content}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {format(new Date(message.createdAt), "dd/MM/yyyy HH:mm:ss", {
                locale: ptBR,
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <button
          onClick={handleScrollToBottomClick}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition opacity-75 hover:opacity-100"
        >
          Ir para o final
        </button>
      )}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white transition-all duration-300 ${
          isAtBottom ? "bg-transparent" : "bg-white"
        }`}
      >
        <div className="flex items-center space-x-2 p-4 bg-white">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            onChange={(event) => setMessage(event.target.value)}
            value={message}
            onKeyDown={handleKeyDown}
            disabled={isSpam}
          />
          <button
            onClick={sendMessage}
            className={`px-4 py-2 rounded-lg transition duration-200 ${
              isSpam
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isSpam}
          >
            {isSpam ? `Aguarde ${spamCountdown}s` : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
