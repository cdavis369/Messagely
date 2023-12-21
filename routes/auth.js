const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config")
const ExpressError = require("../expressError");
const User = require("../models/user");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            const error = new ExpressError("Username and password required", 400);
            return next(error);
        }

        if (User.authenticate(username, password)) {
            User.updateLoginTimestamp(username);
            const token = jwt.sign({username}, SECRET_KEY);
            return res.json({token});
        }
    } catch (error) {
        return next(error);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
    const {username, password, first_name, last_name, phone} = req.body;

    if (!username || !password || !first_name || !last_name || !phone) {
        const error =  new ExpressError(
            "Username, password, first name, lastname, and phone number are required", 400
        );
        return next(error);
    }

    const user = new User(req.body)

    try {
        console.log(await user.register(password));
        const token = jwt.sign({username}, SECRET_KEY);
        return res.json({token});
    } catch (error) {
        return next(error);
    }
})
module.exports = router;