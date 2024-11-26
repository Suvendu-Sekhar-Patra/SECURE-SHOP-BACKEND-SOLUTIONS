import express from 'express';
import { validate } from "../middleware/validate";
import { makeUpiPayment, checkpaymentStatus } from '../controllers/payment.controller';
import { makePaymentSchema, getPaymentStatusSchema } from "../schemas/payment.schema";

import { jsonToPdfConversion } from "../controllers/pdfReportCreation.controller";


const router = express.Router();

router.post('/makepayment', validate(makePaymentSchema), makeUpiPayment);
router.post('/paymentstatus', validate(getPaymentStatusSchema), checkpaymentStatus);


router.post('/pdfReport', jsonToPdfConversion);



export default router;
