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
        const { email, password } = req.body;
        let result = await this.model.login(email, password);
        res.status(200).json(result);
    }

    async create(req, res) {
        const { name, email, password } = req.body;
        let user = await this.model.create(name, email, password);
        res.status(200).json(user);
    }
}

export default UserController;