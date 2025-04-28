
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

    console.log('Processing request with image and parameters...');
    console.log('Target audience:', targetAudience);
    console.log('Text length:', textLength);
    console.log('Theme:', theme);

    const maxLength = textLength === 'short' ? 300 : 1000;
    const styleInstruction = textLength === 'short' 
      ? 'seja objetivo, direto e focado'
      : 'seja detalhista, descreva com mais profundidade e conte uma história envolvente';

    const prompt = `
      Você é um especialista em copywriting para e-commerce.
      
      INSTRUÇÕES IMPORTANTES:
      1. ANALISE CUIDADOSAMENTE A IMAGEM que estou enviando
      2. A imagem mostra um produto real que precisa de texto persuasivo para mídia social
      3. Combine sua análise da imagem com o tema fornecido: "${theme}"
      4. Crie 3 variações de copywriting para mídia social baseadas DIRETAMENTE no que você VÊ na imagem
      5. O texto deve claramente se referir às características visíveis do produto na imagem
      6. Seja detalhado em sua análise da imagem - descreva e mencione cores, formas, texturas e elementos visíveis
      
      Especificações adicionais:
      - Público-alvo: ${targetAudience}
      - ${styleInstruction}
      - Incluir emojis: ${includeEmojis ? 'sim' : 'não'}
      - Incluir hashtags automáticas: sim
      - Hashtags personalizadas: ${customHashtags ? customHashtags : 'nenhuma'}
      
      Cada texto deve ter no máximo ${maxLength} caracteres.
      Seja criativo, emocional e objetivo, incentivando a ação.
      
      Formate sua resposta em três parágrafos separados, um para cada variação.
      NÃO inclua numeração, títulos ou explicações adicionais na resposta.
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
      console.error('Error: No valid response from Gemini API', data);
      throw new Error('No copy generated');
    }

    const generatedTexts = data.candidates[0].content.parts[0].text
      .split('\n\n')
      .filter((t: string) => t.trim() !== '')
      .slice(0, 3);
    
    console.log(`Successfully generated ${generatedTexts.length} variations`);

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
