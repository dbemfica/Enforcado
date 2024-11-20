// Import the necessary modules using ES6 syntax
import express from 'express';
import config from 'config';
import AuthenticateTokenMiddleware from './src/middlewares/AuthenticateTokenMiddleware.js';
import UserController from './src/controller/UserController.js';
import UserModel from './src/model/UserModel.js';
import GameController from './src/controller/GameController.js';
import GameModel from './src/model/GameModel.js';
const JwtConfig = config.get('JwtConfig');

const app = express();
app.use(express.json());

import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database/database.db');

const authenticateTokenMiddleware = new AuthenticateTokenMiddleware(JwtConfig.secret);

const userModel = new UserModel(db);
const userController = new UserController(userModel);

const gameModel = new GameModel(db);
const gameController = new GameController(gameModel);

app.post('/login', (req, res) => userController.login(req, res));
app.get('/user/list', authenticateTokenMiddleware.handle(), (req, res) => userController.index(req, res));
app.post('/user/create', (req, res) => userController.create(req, res));

app.post('/game/start', authenticateTokenMiddleware.handle(), (req, res) => gameController.startGame(req, res));
app.post('/game/guess', authenticateTokenMiddleware.handle(), (req, res) => gameController.guessWord(req, res));

app.get('/migrations', (req, res) => gameController.migrations(req, res));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});