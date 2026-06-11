import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAppContext } from '../context/AppContext';
import { SYSTEM_INSTRUCTION, TOOLS } from '../constants';

export const useAgent = () => {
  const { addMessage, updateInventory, addRecipe, logWaste, recordSale, inventory } = useAppContext();
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      if (!process.env.API_KEY) {
        console.error("API_KEY is missing");
        return;
      }
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: TOOLS }],
            temperature: 0.2, // Lower temperature for more deterministic tool calling
          }
        });
      } catch (error) {
        console.error("Failed to initialize Gemini chat:", error);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(async (text: string, base64Image?: string, mimeType?: string) => {
    if (!chatRef.current) return;

    setIsTyping(true);
    
    try {
      let response;
      
      // Prepare context string to help the model make better decisions
      const contextStr = `\n[Contexto del Sistema: Inventario actual tiene ${inventory.length} items.]`;
      const messageText = text + contextStr;

      if (base64Image && mimeType) {
        response = await chatRef.current.sendMessage({
          message: [
            { text: messageText },
            { inlineData: { data: base64Image, mimeType } }
          ]
        });
      } else {
        response = await chatRef.current.sendMessage({ message: messageText });
      }

      // Handle Tool Calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          console.log("Tool called:", call.name, call.args);
          let result = "Success";
          
          try {
            switch (call.name) {
              case 'update_inventory':
                updateInventory(call.args.items as any);
                break;
              case 'add_recipe':
                addRecipe(call.args as any);
                break;
              case 'log_waste':
                logWaste(call.args.itemName as string, call.args.quantity as number, call.args.unit as string, call.args.reason as string);
                break;
              case 'record_sale':
                recordSale(call.args.recipeName as string, call.args.quantity as number, call.args.totalRevenue as number);
                break;
              default:
                result = "Unknown function";
            }
          } catch (e: any) {
            result = `Error executing function: ${e.message}`;
            console.error(result);
          }

          // Send tool response back to model
          response = await chatRef.current.sendMessage({
             message: [{
               functionResponse: {
                 name: call.name,
                 response: { result }
               }
             }]
          });
        }
      }

      if (response.text) {
        addMessage({ role: 'model', text: response.text });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({ role: 'model', text: 'Lo siento, tuve un problema procesando tu solicitud. ¿Podrías intentar de nuevo?' });
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, updateInventory, addRecipe, logWaste, recordSale, inventory.length]);

  return { sendMessage, isTyping };
};
