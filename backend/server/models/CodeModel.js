import mongoose from 'mongoose'

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  }
});

export default mongoose.model("Code",codeSchema)