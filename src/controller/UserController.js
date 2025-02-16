class UserController {
    model = null
    constructor(userModel) {
        this.model = userModel;
    }

    async index(req, res) {
        let users = await this.model.getAllUsers();
        res.status(200).json(users);
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            let result = await this.model.login(email, password);
            res.status(200).json(result);
        } catch (err) {
            res.status(401).json(err);
        }
    }

    async create(req, res) {
        try {
            const { name, email, password } = req.body;
            let user = await this.model.create(name, email, password);
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json(err);
        }
    }
}

export default UserController;