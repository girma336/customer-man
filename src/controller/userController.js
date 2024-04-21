import { sendBadRequest, sendCreatSuccess, sendFildReq, sendForbidden, sendSuccess, sendToken, sendUnauthorized } from "../utils/responseUtil.js";
import {db} from '../database/config.js';
import { generateActivationCode } from "../utils/activationCode.js";
import { decryptAES, encryptAES } from "../utils/encryptionRes.js";
import  bcrypt from 'bcrypt';
import signToken from "../utils/jwtUtils.js";

export const createCustomer = async (req, res) => {
  const { full_name, phone_number, email, } = req.body;

  if (!full_name || !phone_number || !email)
    return sendFildReq(res, "All fields are required");

  const customer = 'SELECT * FROM Customer WHERE phone_number= ? || email =?'
  const [rows] = await db.query(customer, [phone_number, email]);

  if(rows.length > 0) {
      return sendFildReq(res, "Customer already exist")
  }

  let sql = "INSERT INTO Customer (full_name, phone_number, email) VALUES (?, ?, ?)";
  await db.query(sql, [full_name, phone_number, email]);
  
  return sendCreatSuccess(res, "Customer has been created");
};

export const sendActivationCode = async(req, res) => {
  const { phone_number } = req.body;

  if(!phone_number) 
    return sendFildReq(res, "All fields are required");

  const customer = 'SELECT * FROM Customer WHERE phone_number= ?'
  const [rows] = await db.query(customer, [phone_number]);
  
  if(rows.length == 0) {
    return sendFildReq(res, "Customer not found")
  }

  const cus = rows[0]
  if(cus.is_active) {
    return sendForbidden(res, 'This account already activated');
  }

  const activation_code = generateActivationCode(6);
  let sql = "UPDATE Customer SET activation_code = ? WHERE phone_number = ?";
  await db.query(sql, [activation_code, phone_number]);
  const encrypt = encryptAES(activation_code)
  const dec = await decryptAES(encrypt)
  console.log("decrypted activation code", dec)
  return sendSuccess(res, `Activation code send successfully: ${phone_number}`, {activation_code: encrypt})
}

export const activationAccount = async(req, res) => {
  const { phone_number, activation_code } = req.body;
  
  try {
    if(!phone_number || !activation_code) 
    return sendFildReq(res, "All fields are required");
  
    const cus = 'SELECT * FROM Customer WHERE phone_number= ?'
    const [rows] = await db.query(cus, [phone_number]);
      
    if(rows.length == 0) {
      return sendFildReq(res, "Customer not found")
    }

    const customer = rows[0];
    if (customer.activation_code !== activation_code) {
      return sendFildReq(res, "Invalid activation code");
    }
    
    let sql = "UPDATE Customer SET is_active = ? WHERE phone_number = ? && activation_code = ?";
    await db.query(sql, [true, phone_number, activation_code]);

    return sendSuccess(res, 'Customer account is activate successfully')
  } catch (error) {
    return sendBadRequest(res, "Internal server", error)
  }
}


export const registerDeviceCode = async(req, res) => {
  const { phone_number, device_code, PIN } = req.body;
  try {
    if(!phone_number || !device_code || !PIN ) 
    return sendFildReq(res, "All fields are required");
  
    const cus = 'SELECT * FROM Customer WHERE phone_number= ?'
    const [rows] = await db.query(cus, [phone_number]);
      
    if(rows.length == 0) {
      return sendFildReq(res, "Customer not found")
    }

    const [checkDevideIfExist] = await db.query('SELECT * FROM Customer WHERE device_code = ? && phone_number =?', [device_code, phone_number])
   
    if(checkDevideIfExist.length > 0) {
      return sendFildReq(res, "This device already register before");
    }

    const customer = rows[0];
    if (!customer.is_active) {
      return sendFildReq(res, "Your account is not active");
    }
    const hashedPassword = await bcrypt.hash(PIN, 10);
    let sql = "UPDATE Customer SET PIN = ?, device_code = ? WHERE phone_number = ? && is_active = ?";
    await db.query(sql, [hashedPassword, device_code, phone_number, true]);
    const getCustomer = 'SELECT full_name, phone_number, email FROM Customer WHERE phone_number = ? && is_active = ?'
    const [getRow] = await db.query(getCustomer, [phone_number, true]);
    const enc = getRow[0];
    let encrypt;
    try {
       encrypt = encryptAES(enc)
    } catch (error) {
      console.log(error)
    }
    console.log(getRow[0])
    return sendSuccess(res, 'Customer signup successfully', encrypt)
  } catch (error) {
    return sendBadRequest(res, "Internal server", error)
  }
}

export const loginWithPIN = async(req, res) => {
  const { phone_number, device_code, PIN } = req.body;
  try {
    if(!phone_number || !device_code || !PIN ) 
    return sendFildReq(res, "All fields are required");
  
    const cus = 'SELECT * FROM Customer WHERE phone_number = ? OR device_code = ?'
    const [rows] = await db.query(cus, [phone_number, device_code]);
    console.log(rows[0]);
    if(rows.length == 0) {
      return sendFildReq(res, "Customer not found")
    }
    
    const customer = rows[0];

    if(customer.is_blocked) {
      return sendForbidden(res, 'This account has been blocked')
    }

    if(customer.phone_number !== phone_number || customer.device_code !== device_code) {
      let sql = "UPDATE Customer SET is_blocked = ? WHERE phone_number = ? OR device_code = ?";
      await db.query(sql, [true, phone_number, device_code]);
      return sendForbidden(res, "Your account is blocked please contact admin");
    }

    if (!customer.is_active) {
      return sendFildReq(res, "Your account is not active");
    }

    if (!await bcrypt.compare(PIN, customer.PIN)) {
      customer.login_attempts += 1;
    
      await db.query('UPDATE Customer SET login_attempts = ? WHERE phone_number = ?', [customer.login_attempts, phone_number]);
    
      if (customer.login_attempts >= customer.MAX_LOGIN_ATTEMPTS) {
        customer.is_blocked = true;
        await db.query('UPDATE Customer SET is_blocked = true WHERE phone_number = ?', [phone_number]);
    
        return sendForbidden(res, 'Maximum login attempts reached. This account has been blocked');
      }
    
      return sendUnauthorized(res, "Invalid phone number or PIN");
    }
    const token = signToken(phone_number);

    await await db.query('UPDATE Customer SET login_attempts = ? WHERE phone_number = ?', [0, phone_number]);
    
    let encrypt;
    try {
       encrypt = encryptAES(token)
    } catch (error) {
      console.log(error)
    }
    
    return sendToken(res, encrypt)
  } catch (error) {
    return sendBadRequest(res, "Internal server", error)
  }
}


export const getCustomer = async (req, res) => {
  const customer = await req.customer;
  console.log(customer)
  try {
    const customer = await req.customer;
    return sendSuccess(res, 'Current customer retrive successfully', customer);
  } catch (error) {
    return sendBadRequest(res, "Internal server", error)
  }
}

export const deleteCustomer = async (req, res) => {
  try {
    const { phone_number } =  req.params;
    await db.query('DELETE FROM Customer WHERE phone_number = ?', [phone_number]);
    return sendSuccess(res, 'Customer deleted successfully');
  } catch (error) {
    return sendBadRequest(res, "Internal server", error)
  }
}
