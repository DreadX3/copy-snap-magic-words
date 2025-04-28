
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, includeEmojis, customHashtags, targetAudience, imageDescription, theme, textLength } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const maxLength = textLength === 'short' ? 300 : 1000;
    const styleInstruction = textLength === 'short' 
      ? 'seja objetivo, direto e focado'
      : 'seja detalhista, descreva com mais profundidade e conte uma história envolvente';

    const prompt = `
      Você é um especialista em copywriting para e-commerce.
      Crie 3 variações de texto para mídia social com as seguintes especificações:
      
      Imagem: ${imageDescription}
      Tema personalizado: ${theme}
      Público-alvo: ${targetAudience}
      
      Por favor:
      1. Analise cuidadosamente o conteúdo da imagem descrita
      2. Considere o tema personalizado fornecido
      3. Combine essas informações para gerar um texto relevante e persuasivo
      4. ${styleInstruction}
      
      Preferências:
      - Incluir emojis: ${includeEmojis ? 'sim' : 'não'}
      - Incluir hashtags automáticas: sim
      - Hashtags personalizadas: ${customHashtags ? customHashtags : 'nenhuma'}
      
      Cada texto deve ter no máximo ${maxLength} caracteres.
      Seja criativo, emocional e objetivo, incentivando a ação.
      
      Formate sua resposta em três parágrafos separados, um para cada variação.
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageUrl.split(',')[1] // Remove the data:image/jpeg;base64, prefix
            }
          }
        ]
      }]
    };

    console.log('Making request to Gemini API...');
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Received response from Gemini API');

    if (!data || !data.candidates || data.candidates.length === 0) {
      throw new Error('No copy generated');
    }

    const generatedTexts = data.candidates[0].content.parts[0].text
      .split('\n\n')
      .filter((t: string) => t.trim() !== '')
      .slice(0, 3);

    return new Response(
      JSON.stringify({ success: true, copies: generatedTexts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating copy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
