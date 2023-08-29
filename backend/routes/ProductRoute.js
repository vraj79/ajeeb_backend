const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductById, createProductReview, delProductReview, getProductReviews, getAdminProducts,getProductCategories } = require("../controllers/productController");

const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth")
const ProductRouter = express.Router();

ProductRouter.route('/get/reviews').get(getProductReviews);
ProductRouter.route("/").get(getAllProducts);
ProductRouter.route('/get/categories').get(getProductCategories);
ProductRouter.route("/add").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
ProductRouter.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);
ProductRouter.route('/create/review').put(isAuthenticatedUser, createProductReview);
ProductRouter.route('/del/review').delete(isAuthenticatedUser, delProductReview);
ProductRouter.route("/:id").get(getProductById).patch(isAuthenticatedUser, authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

module.exports = ProductRouter;