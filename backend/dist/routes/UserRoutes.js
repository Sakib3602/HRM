"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // এই ফাইলের সব route এ লগইন লাগবে
router.get("/me", UserController_1.getMyProfile);
router.get("/", auth_1.hrOnly, UserController_1.getUsers);
router.post("/", auth_1.hrOnly, UserController_1.createUser);
router.patch("/:id", auth_1.hrOnly, UserController_1.updateUser);
router.delete("/:id", auth_1.hrOnly, UserController_1.deleteUser);
exports.default = router;
