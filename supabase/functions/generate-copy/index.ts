
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
    const { imageUrl, includeEmojis, customHashtags, targetAudience, imageDescription } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and convert image to base64
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const base64Image = await blobToBase64(imageBlob);

    const prompt = `
      You are an expert e-commerce copywriter.
      Create 3 short, compelling product copy variations for social media.
      
      Image description: ${imageDescription || 'No description provided'}
      Target audience: ${targetAudience}
      
      Preferences:
      - Include emojis: ${includeEmojis ? 'yes' : 'no'}
      - Include automatic hashtags: yes
      - Custom hashtags: ${customHashtags ? customHashtags : 'none'}
      
      Each copy should be max 300 characters.
      Be creative, emotional, objective, and encourage action.
      
      Format your response as three separate paragraphs, one for each variation.
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
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

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary);
}
