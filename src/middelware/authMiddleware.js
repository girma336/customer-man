import jwt from 'jsonwebtoken';
import {db} from '../database/config.js';
import dotenv from "dotenv";
import { decryptAES } from '../utils/encryptionRes.js';
dotenv.config();

const key = process.env.JWT_SECRET
export const  authMiddleware = async (req, res, next) => {
 
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    const decryptToken = decryptAES(token)
    const decodedToken = jwt.verify(JSON.parse(decryptToken), key);
    const [currentUser] = await db.query('SELECT * FROM Customer WHERE phone_number = ?', [decodedToken.phone_number]);
    if (currentUser.length ==  0) {
      return res.status(401).json({ message: 'Authentication failed: Customer not found' });
    }
    const customers = currentUser[0];
    req.customer = customers;
    next();
    return;
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    } else {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}