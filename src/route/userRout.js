import express from "express";
import { createCustomer, activationAccount, sendActivationCode, registerDeviceCode, loginWithPIN, getCustomer, deleteCustomer } from "../controller/userController.js";
import { authMiddleware } from "../middelware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createCustomer).get(authMiddleware, getCustomer);
router.route('/activation').post(sendActivationCode);
router.route('/activate').post(activationAccount);
router.route('/register').post(registerDeviceCode);
router.route('/login').post(loginWithPIN);
router.route("/delete/:phone_number").delete(deleteCustomer);

export default router;