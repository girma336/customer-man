import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();

const signToken = (id) => {
  const token = jwt.sign({ phone_number: id }, process.env.JWT_SECRET, {
    expiresIn: '20d',
  });
  return token;
};

export default signToken;