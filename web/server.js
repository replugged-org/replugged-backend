import express from 'express';
import cors from 'cors';
const app = express();

app.listen(Number(process.env.PORT ?? 8000), () => {
  console.log(`Listening on port ${Number(process.env.PORT ?? 8000)}`);
});

app.use(cors());

app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});
