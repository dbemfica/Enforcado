class GameController {
    model = null
    constructor(gameModel) {
        this.model = gameModel;
    }

    async index(req, res) {
        const game = await this.model.getGame();
        res.status(200).json("ok");
    }

    async startGame(req, res) {
        console.log("startGame");
        let userId = req.user.id;
        const game = await this.model.startGame(userId);
        res.status(200).json(game);
    }

    async guessWord(req, res) {
        console.log("guessWord");
        const { gameId, letter } = req.body;
        let userId = req.user.id;
        const game = await this.model.guessWord(userId, gameId, letter);
        res.status(200).json(game);
    }

    async migrations(req, res) {
        const game = await this.model.migration();
        res.status(200).json("migration ok");
    }
}

export default GameController;