class GameModel {

    db = null;

    constructor(db) {
        this.db = db;
    }

    async migration() {
        this.db.serialize(() => {
            this.db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, created_at DATETIME);");
            this.db.run("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, word TEXT NOT NULL, created_at DATETIME);");
            this.db.run("CREATE TABLE IF NOT EXISTS games_guess (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, game_id INTEGER NOT NULL, guess TEXT NOT NULL, finded BOOLEAN NOT NULL, created_at DATETIME);");
            this.db.run("CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT NOT NULL);");
            
            const stmt = this.db.prepare("INSERT INTO words (word) VALUES (?)");
            stmt.run("abacaxi");
            stmt.run("cadeira");
            stmt.run("elefante");
            stmt.run("esperanca");
            stmt.run("girassol");
            stmt.run("computador");
            stmt.run("sorvete");
            stmt.run("felicidade");
            stmt.run("relogio");
            stmt.run("astronauta");
            stmt.run("bicicleta");
            stmt.run("borboleta");
            stmt.run("estrogonofe");
            stmt.run("televisao");
            stmt.run("fotografia");
            stmt.run("dinossauro");
            stmt.run("amizade");
            stmt.run("chocolate");
            stmt.run("enciclopedia");
            stmt.run("pipoca");
            stmt.run("jacare");
            stmt.run("relogio");
            stmt.run("aventura");
            stmt.run("professor");
            stmt.run("estudante");
            stmt.run("caminhao");
            stmt.run("amizade");
            stmt.run("violao");
            stmt.run("floresta");
            stmt.run("cebola");
            stmt.run("travesseiro");
            stmt.run("cortina");
            stmt.run("escola");
            stmt.run("passaro");
            stmt.run("universo");
            stmt.run("horizonte");
            stmt.run("tigre");
            stmt.run("almofada");
            stmt.run("telefone");
            stmt.run("borracha");
            stmt.run("corrente");
            stmt.run("paralelepipedo");
            stmt.run("bicicleta");
            stmt.run("infancia");
            stmt.run("astronauta");
            stmt.run("biblioteca");
            stmt.run("eletricidade");
            stmt.run("natureza");
            stmt.run("planeta");
            stmt.run("abelha");
            stmt.finalize();
        });
        
        this.db.close();
    }

    async startGame(userId) {
        try {
            
            let id = Math.floor(Math.random() * 50) + 1;

            const wordRow = await new Promise((resolve, reject) => {
                this.db.get("SELECT * FROM words WHERE id = ?", [id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            const gameId = await new Promise((resolve, reject) => {
                const stmt = this.db.prepare("INSERT INTO games (user_id, word, created_at) VALUES (?, ?, ?)");
                stmt.run(userId, wordRow.word, new Date().toISOString(), function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
                stmt.finalize();
            });

            const gameRow = await new Promise((resolve, reject) => {
                this.db.get("SELECT * FROM games WHERE id = ?", [gameId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            return {
                id: gameRow.id,
                word: this.ofuscateWord(gameRow.word)
            };
        } catch (err) {
            throw err;
        }
    }

    async guessWord(userId, gameId, letter) {
        const game = await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM games WHERE id = ?", [gameId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        var letter = letter.toLowerCase();
        var word = game.word.toLowerCase();
        let finded = word.includes(letter);

        const guessRows = await new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM games_guess WHERE game_id = ?", [gameId], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });

        let alreadyGuess = false;
        let guessArray = [];
        for (let i = 0; i < guessRows.length; i++) {
            guessArray.push(guessRows[i].guess);
            if (guessRows[i].guess === letter) {
                alreadyGuess = true;
            }
        }
        if (finded === true) {
            guessArray.push(letter);
        }
        let finished = this.checkGameStatus(game.word, guessArray)

        if (alreadyGuess === false && finished === false) {
            await new Promise((resolve, reject) => {
                const stmt = this.db.prepare("INSERT INTO games_guess (user_id, game_id, guess, finded, created_at) VALUES (?, ?, ?, ?, ?)");
                stmt.run(userId, gameId, letter, finded, new Date().toISOString(), function(err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(this.lastID);
                });
                stmt.finalize();
            });
        }

        return {
            id: game.id,
            word: this.ofuscateWord(game.word, guessArray),
            finded: finded,
            alreadyGuess: alreadyGuess,
            score: finished == true ? this.calcScore(game.word, guessArray) : null,
            finished: finished,
            yourGuess: guessArray
        };
    }

    calcScore(word, guess) {
        let score = 0;
        for (let i = 0; i < guess.length; i++) {
            if (word.includes(guess[i]) == true) {
                score++;
            } else {
                score--;
            }
        }
        return `${score}/${word.length}`;
    }

    checkGameStatus(word, guess) {
        let finished = true;
        if (guess === null) {
            return false;
        }
        for (let i = 0; i < word.length; i++) {
            if (guess.includes(word[i]) === false) {
                finished = false;
                break;
            }
        }
        return finished;
    }

    ofuscateWord(word, guess = null) {
        let ofuscatedWord = [];
        for (let i = 0; i < word.length; i++) {
            if (guess !== null && guess.includes(word[i])) {
                ofuscatedWord.push(word[i]);
            } else {
                ofuscatedWord.push("_");
            }
        }
        return ofuscatedWord.join(" ");
    } 
}

export default GameModel;