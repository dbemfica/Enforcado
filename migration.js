import sqlite3 from 'sqlite3';
import GameModel from './src/model/GameModel.js';

const db = new sqlite3.Database('./database/database.db');

const gameModel = new GameModel(db);
gameModel.migration();