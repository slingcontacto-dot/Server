import { GoogleGenAI } from "@google/genai";
import { Product, Order } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const analyzeBusinessData = async (products: Product[], recentOrders: Order[]): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "⚠️ La IA no está activa. Asegúrate de agregar la variable de entorno 'API_KEY' en Vercel con tu clave de Google Gemini.";

  // Prepare context data
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const stockSummary = products.map(p => `- ${p.name}: Stock ${p.stock} (${p.unit}), Min ${p.minStock}`).join('\n');
  
  const lastOrdersSummary = recentOrders.slice(0, 5).map(o => 
    `- Orden #${o.id} para ${o.customerName}: $${o.total} (${o.date.split('T')[0]})`
  ).join('\n');

  const prompt = `
    Actúa como un experto consultor de negocios para una distribuidora de insumos de heladería.
    Analiza los siguientes datos actuales de inventario y ventas recientes.
    
    INVENTARIO ACTUAL:
    ${stockSummary}

    VENTAS RECIENTES:
    ${lastOrdersSummary}

    ITEMS CON STOCK CRÍTICO:
    ${lowStockItems.map(p => p.name).join(', ') || "Ninguno"}

    Por favor provee un reporte breve (máximo 3 párrafos) en formato Markdown:
    1. Alertas urgentes de stock.
    2. Análisis rápido de ventas recientes.
    3. Una recomendación estratégica para mejorar el negocio esta semana.
    
    Sé profesional, conciso y directo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocurrió un error al contactar al asistente AI. Verifique su API Key.";
  }
};