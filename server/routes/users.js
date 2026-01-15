const express = require('express');
const User = require("../models/User");
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get("/all", authMiddleware, async(req, res)=> {
    const users = await User.find({_id: {$ne: req.userId} }).select("name email")
    res.json(users)
})

module.exports = router