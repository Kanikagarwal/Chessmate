import CodeModel from "../models/CodeModel.js";

export async function codeCreate(req,res,next) {
    try {
        const {codeGet} = req.body;
        const codeExist = await CodeModel.findOne({code:codeGet});
        if(codeExist){
            return res.status(400).json({msg:"Code already exist. Try another code", status:false});
        }

        const codeObj = await CodeModel.create({
            code:codeGet
        })
        return res.status(201).json({ status: true, code: codeObj });
    } catch (error) {
        next(error)
    }
}

export async function codeValidate(req,res,next) {
    try {
        const {codeGet} = req.body;
        const codeExist = await CodeModel.findOne({code:codeGet});
        if(!codeExist){
            return res.status(400).json({msg:"Code doesn't exist. Try again.", status:false});
        }

         await CodeModel.deleteOne({ code: codeGet });
        return res.status(201).json({ status: true });
    } catch (error) {
        next(error)
    }
}