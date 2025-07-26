øconst express = require('express');
const axios = require('axios');
const { YouTubeTranscriptApi } = require('youtube-transcript-ts');
const cors = require('cors');
app.use(cors());

// MANUAL: Lide com requisições OPTIONS CORS para todos os endpoints
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

Access-Control-Allow-Origin: *

const app = express();
app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

app.post('/sendQuestion', async (req, res) => {
  const { question, timestamp, videoId } = req.body;

  if (!question || !videoId) {
    return res.status(400).json({ error: 'Os campos question e videoId são obrigatórios.' });
  }

  try {
    // 1. Obter a transcrição do vídeo do YouTube
    const api = new YouTubeTranscriptApi();
    const transcriptResponse = await api.fetchTranscript(videoId);

    // Montar texto completo da transcrição
    const fullTranscriptText = transcriptResponse.transcript.snippets
      .map(snippet => snippet.text)
      .join(' ');

    // Montar o prompt para enviar ao LLM (Perplexity)
    const prompt = `Você é um assistente inteligente que responde perguntas baseadas na transcrição do vídeo do YouTube. 
Pergunta: "${question}"
Timestamp: ${timestamp}s
Contexto (transcrição do vídeo):
${fullTranscriptText}`;

    // 2. Chamar API da Perplexity para obter resposta
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-medium-online',
        messages: [
          { role: 'system', content: 'Você é um assistente prestativo.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices[0].message.content;

    // 3. Retornar para o frontend
    res.status(200).json({ answer });

  } catch (error) {
    console.error('Erro no backend:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao processar a requisição. Verifique se o vídeo tem legenda pública e sua chave API está configurada.'
    });
  }
});

module.exports = app;

