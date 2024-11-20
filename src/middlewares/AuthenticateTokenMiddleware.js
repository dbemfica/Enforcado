import jwt from 'jsonwebtoken';

class AuthenticateTokenMiddleware {

    secret = null

    constructor(secret) {
        this.secret = secret;
    }

    handle() {
        return (req, res, next) => {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
            }

            jwt.verify(token, this.secret, (err, user) => {
                if (err) {
                    return res.status(401).json({ message: 'Token inválido.' });
                }

                req.user = user;
                next();
            });
        };
    }
}

export default AuthenticateTokenMiddleware;