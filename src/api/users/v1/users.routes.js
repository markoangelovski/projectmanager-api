const router = require("express").Router();

// Controllers
const {
  checkAuth,
  getAllUsers,
  register,
  login,
  logout,
  updateService,
  createApiKey,
  getApiKeys,
  deleteApiKeys
} = require("./users.controller");

// Middleware imports
const {
  isLoggedIn,
  isAdmin,
  hasBody
} = require("../../../middlewares/users/checkUser");

// @route POST /auth
// @desc Check if user it authenticated
router.post("/", isLoggedIn, checkAuth);

// @route GET /auth
// @desc Get all users
router.get("/", isLoggedIn, getAllUsers);

// @route POST /auth/register
// @desc register route
router.post("/register", isLoggedIn, hasBody, isAdmin, register);

// @route POST /auth/login
// @desc Login route
router.post("/login", hasBody, login);

// @route GET /auth/logout
// @desc Logout route
router.get("/logout", isLoggedIn, logout);

// @route PATCH /auth/update
// @desc Update user settings
router.patch("/update", isLoggedIn, isAdmin, updateService);

// @route POST /auth/api-key
// @desc Create a new API key for requested service
router.post("/api-key", isLoggedIn, createApiKey);

// @route GET /auth/api-key
// @desc Get all API keys
router.get("/api-key", isLoggedIn, getApiKeys);

// @route DELETE /auth/api-key
// @desc Delete API keys
router.delete("/api-key", isLoggedIn, deleteApiKeys);

module.exports = router;
