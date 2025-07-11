import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username already taken", status: false });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already taken", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ status: true, user: userObj });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error", status: false });
  }
}

export async function login(req,res,next) {
  try {
    const {username,password} = req.body;
    const usernameCheck = await User.findOne({username});
    if(!usernameCheck){
      return res.status(400).json({msg:"Incorrect username or password",status:false})
    }
    const passwordCheck = await bcrypt.compare(password,usernameCheck.password);
    if(!passwordCheck){
      return res.status(400).json({msg:"Incorrect username or password",status:false})
    }
    const userObj = usernameCheck.toObject();
    delete userObj.password;
    return res.status(201).json({ status: true, user: userObj});
  } catch (error) {
    next(error)
  }
}