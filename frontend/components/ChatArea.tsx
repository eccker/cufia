import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAgent } from '../hooks/useAgent';

export const ChatArea: React.FC = () => {
  const { messages, addMessage } = useAppContext();
  const { sendMessage, isTyping } = useAgent();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const textToSend = inputText;
    const imageToSend = selectedImage;

    // Optimistic UI update
    addMessage({
      role: 'user',
      text: textToSend,
      imageUrl: imageToSend?.preview
    });

    setInputText('');
    setSelectedImage(null);

    await sendMessage(textToSend || "Procesa esta imagen", imageToSend?.data, imageToSend?.mimeType);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
          data: base64String,
          mimeType: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5] relative">
      {/* Chat Header */}
      <div className="bg-[#075e54] text-white p-4 flex items-center shadow-md z-10">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold text-xl mr-3">
          RP
        </div>
        <div>
          <h2 className="font-semibold text-lg">RestoPilot AI</h2>
          <p className="text-xs text-green-100">CFO & Co-Piloto Operativo</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 shadow-sm relative ${
              msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
            }`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto rounded mb-2 max-h-48 object-cover" />
              )}
              <p className="text-gray-800 whitespace-pre-wrap text-sm">{msg.text}</p>
              <span className="text-[10px] text-gray-500 block text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Overlay */}
      {selectedImage && (
        <div className="absolute bottom-20 left-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 flex items-start space-x-2">
          <img src={selectedImage.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
          <button onClick={() => setSelectedImage(null)} className="text-red-500 text-xs font-bold">X</button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#f0f0f0] p-3 flex items-center space-x-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Paperclip className="w-6 h-6" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje o sube un ticket..."
          className="flex-1 py-2 px-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#075e54] bg-white"
        />
        <button 
          onClick={handleSend}
          disabled={!inputText.trim() && !selectedImage || isTyping}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${
            (!inputText.trim() && !selectedImage) || isTyping ? 'bg-gray-300 text-gray-500' : 'bg-[#075e54] text-white hover:bg-[#128c7e]'
          }`}
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};
