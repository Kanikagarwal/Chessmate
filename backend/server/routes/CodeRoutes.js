import express from 'express'
import { codeCreate,codeValidate } from '../controller/CodeController.js';

const router = express.Router();

router.post("/create",codeCreate)
router.post("/join",codeValidate)

export default router;