const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getUserById, updateRole, delUser } = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const UserRouter = express.Router();

UserRouter.post("/register", registerUser)
UserRouter.post("/login", loginUser);
UserRouter.post("/forgot/password", forgotPassword)
UserRouter.put("/password/reset/:token", resetPassword)
UserRouter.get("/logout", logoutUser);
UserRouter.get("/details", isAuthenticatedUser, getUserDetails)
UserRouter.put("/password/update", isAuthenticatedUser, updatePassword)
UserRouter.put("/profile/update", isAuthenticatedUser, updateProfile)
UserRouter.get("/all", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers)
UserRouter.get("/:id", isAuthenticatedUser, authorizeRoles("admin"), getUserById)
UserRouter.put("/role/update/:id", isAuthenticatedUser, authorizeRoles("admin"), updateRole)
UserRouter.delete("/:id", isAuthenticatedUser, authorizeRoles("admin"), delUser)

module.exports = UserRouter