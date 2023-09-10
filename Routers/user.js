import express from "express"
import bcrypt from "bcryptjs"
import { addUser, generateJwtToken, getUser } from "../Controllers/user.js";


const router = express.Router();



router.post("/signup", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const user = await getUser(req.body.email)
        if (!user) {
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const hashedUser = await { ...req.body, password: hashedPassword }
            const result = await addUser(hashedUser)
            return res.status(200).json({ result, data: "Added sucessfully" })
        }
        res.status(400).json({ data: "Given email already exist" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: "Internal server Error" })

    }

})

router.post("/login", async (req, res) => {
    try {
        //user available
        console.log(req.body)
        const user = await getUser(req.body.email);

        if (!user) {
            return res.status(404).json({ data: "invaild email" })

        }
        //is password valid
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if (!validPassword) {
            return res.status(400).json({ data: "Invalid Password" })
        }
        const token = generateJwtToken(user._id);
        res.status(200).json({
            message: "sucessfully loggedIn",
            token: token
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: "Internal server error" })
    }
})


export const userRouter = router