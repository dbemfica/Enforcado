import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config';
const JwtConfig = config.get('JwtConfig');

class UserModel {

    db = null;

    constructor(db) {
        this.db = db;
    }

    async login(email, password) {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        let user = await this.getUserByEmail(email);
        if (user && user.password === hashedPassword) {
            let token = jwt.sign({ id: user.id, email: user.email }, JwtConfig.secret, { expiresIn: '1h' });
            return { message: 'Login successful', token: token };
        } else {
            return { message: 'Login failed' };
        }
    }

    async create(name, email, password) {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        this.db.serialize(() => {
            const stmt = this.db.prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)");
            stmt.run(name, email, hashedPassword, new Date().toISOString());
            stmt.finalize();    
        });
        this.db.close();
        let user = await this.getUserByEmail(email);
        return user;
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM users", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

export default UserModel;