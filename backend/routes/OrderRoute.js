const express = require("express");
const { newOrder, getSingleOrder, getAllOrders, updateOrder, delOrder, getMyOrders } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const OrderRouter = express.Router();

OrderRouter.route("/my").get(isAuthenticatedUser, getMyOrders);
OrderRouter.route("/new").post(isAuthenticatedUser, newOrder);
OrderRouter.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
OrderRouter.route("/update/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder);
OrderRouter.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), delOrder);
OrderRouter.route("/:id").get(isAuthenticatedUser, getSingleOrder);

module.exports = OrderRouter;
