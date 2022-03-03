import express from 'express';
import { AuthenticationRouter } from './Routers/authentication.router';
import { RoomsRouter } from './Routers/rooms.router';
const app = express();
const port = 3000;

app.use(express.static('public'));

app.use('/auth', AuthenticationRouter);
app.use('/rooms', RoomsRouter)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});