const express = require('express');
const app = express();
app.use(express.json());

// Biblioteca para pegar transcrição do YouTube
// npm install youtube-transcript-ts (recomendo essa por ser atualizada e funcional)
const { YouTubeTranscriptApi } = require('youtube-transcript-ts');

app.post('/sendQuestion', async (req, res) => {
  const { question, timestamp, videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required in request body' });
  }

  try {
    // Obter transcrição do vídeo (IDs do YouTube são passados, ex: dQw4w9WgXcQ)
    const api = new YouTubeTranscriptApi();
    const transcriptResponse = await api.fetchTranscript(videoId);

    // Juntar o texto dos snippets da transcrição
    const fullTranscriptText = transcriptResponse.transcript.snippets
      .map(snippet => snippet.text)
      .join(' ');

    // Aqui você integraria a chamada real para o LLM, passando question + transcrição + timestamp
    // Por ora, envia uma resposta simulada com a transcrição parcial para teste:
    const previewTranscript = fullTranscriptText.substring(0, 500); // limitar a 500 caracteres

    res.status(200).json({
      answer: `Pergunta: ${question}\nTranscrição (preview): ${previewTranscript}...`
    });

  } catch (error) {
    console.error('Erro ao obter transcrição:', error);
    res.status(500).json({
      error: 'Não foi possível obter a transcrição do vídeo. Verifique se o vídeo tem legendas públicas disponíveis.'
    });
  }
});

module.exports = app;

