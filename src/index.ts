import express from 'express';
import { AuthenticationRouter } from './Routers/authentication.router';
const app = express();
const port = 3000;

app.use(express.static('public'));

app.use('/auth', AuthenticationRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});