import express from "express";
import { confirmPayment, createCheckoutSession } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/test", (req, res) => {
  res.json({ success: true, message: "Payment routes working" });
});

paymentRouter.post("/create-checkout-session", createCheckoutSession);
paymentRouter.get("/confirm", confirmPayment);

export default paymentRouter;