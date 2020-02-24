const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const authController = require('../controller/auth');

router.get('/', authController.getLogin);
router.get('/registerpage', authController.getRegister);

router.post('/register', async (req, res, next) => {

    const { error } = await registerValidation(req.body);
    if (error) {
        console.log(req.body);

        return res.status(400).send(error.details[0].message);
    }

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) res.status(400).send("Email already exist");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send("User saved");
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/login', async (req, res) => {

    const { error } = await loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) res.status(400).send("Account does not exist");

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Password is incorrect');
    console.log("logged in");
    const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    res.header('auth-token', token).send(token);

})

module.exports = router;