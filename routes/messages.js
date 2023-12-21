const express = require("express");
const router = express.Router();
const expressError = require("../expressError");
const Message = require("../models/message");
const User = require("../models/user");
const { userExists } = require("../models/user");
const { ensureLoggedIn } = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function(req, res) {
    const {id} = req.params;
    if (!id) {
        return res.json({error:"Message ID required"});
    }
    try {
        const message = await Message.get(id);
        const user = req.user.username;
        if (message.from_user.username !== user && message.to_user.username !== user) {
            return res.json({status: 401, message: "Unauthorized"});
        }
        return res.json({message})
    } catch (error) {
        return next(error);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function(req, res) {
    const {from_username, to_username, body} = req.body;
    
    if (!from_username || !to_username || !body) {
        return res.json({error: "Username from, username to, and message body required"});
    }

    if (await User.userExists(to_username)) {
        const message = await Message.create(req.body);
        return res.json({message});
    }

    return res.json({error: "Message recipient not found"});
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req, res) {
    const message = await Message.markRead(req.params.id, req.user.username);
    if (message.error) return res.json(message);
    return res.json({message});
});

module.exports = router;