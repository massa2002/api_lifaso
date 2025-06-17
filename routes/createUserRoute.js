const express = require("express");
const CreateUserController = require("../controllers/createUserController");

const router = express.Router();

router.post("/invite", CreateUserController.sendInvite);
router.delete("/user/:userId", CreateUserController.deleteUser);

module.exports = router;
