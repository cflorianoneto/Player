const express = require('express');
const app = express();

app.use(express.json());

app.post('/sendQuestion', (req, res) => {
  const question = req.body.question;
  const timestamp = req.body.timestamp;
  const answer = `Resposta simulada para '${question}' no tempo ${timestamp}s.`;
  res.status(200).send({ answer });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});


