import { db } from "../config/firebaseAdmin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Reference paths
const usersRef = db.ref("users");
const auditLogsRef = db.ref("auditLogs");

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, tel, email, password, role } = req.body;

    // Check if email already exists
    const snapshot = await usersRef.once("value");
    const users = snapshot.val() || {};
    const duplicate = Object.values(users).find(u => u.email === email);
    if (duplicate) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUserRef = usersRef.push();
    const userData = {
      name,
      tel,
      email,
      password: hashedPassword,
      role: role || "user",
      createdAt: new Date().toISOString(),
    };
    await newUserRef.set(userData);

    // Audit log
    await auditLogsRef.push({
      action: "Register",
      user_id: newUserRef.key,
      target: "users",
      target_id: newUserRef.key,
      description: `Registered user id ${newUserRef.key} as ${userData.role}.`,
      timestamp: new Date().toISOString(),
    });

    // Send JWT
    sendTokenResponse(newUserRef.key, userData, 201, res);
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false });
  }
};

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide an email and password" });
    }

    const snapshot = await usersRef.once("value");
    const users = snapshot.val() || {};
    const userEntry = Object.entries(users).find(([id, u]) => u.email === email);
    if (!userEntry) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const [userId, user] = userEntry;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Audit log
    await auditLogsRef.push({
      action: "Login",
      user_id: userId,
      target: "users",
      target_id: userId,
      description: `User id ${userId} logged in as ${user.role}.`,
      timestamp: new Date().toISOString(),
    });

    sendTokenResponse(userId, user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot login" });
  }
};

// @desc    Logout User
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // JWT logout is just clearing cookie
    res.cookie("token", "none", { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });

    // Audit log
    await auditLogsRef.push({
      action: "Logout",
      user_id: req.user?.id || null,
      target: "users",
      target_id: req.user?.id || null,
      description: `User id ${req.user?.id} logged out.`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Cannot log out" });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const snapshot = await usersRef.child(req.user.id).once("value");
    const user = snapshot.val();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: { id: req.user.id, ...user } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false });
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    const userId = req.user.id;
    if (req.body.name !== undefined) {
      fieldsToUpdate.name = req.body.name;
    }
    if (req.body.tel !== undefined) {
      fieldsToUpdate.tel = req.body.tel;
    }
    
    fieldsToUpdate.updatedAt = new Date().toISOString();
    if (Object.keys(fieldsToUpdate).length <= 1 && !fieldsToUpdate.name && !fieldsToUpdate.tel) {
      // You might want to return an error or a 200 success if nothing was sent
      // For now, we proceed to update the timestamp at least.
    }
    
    await usersRef.child(userId).update(fieldsToUpdate);
    await auditLogsRef.push({
      action: "Update",
      user_id: userId,
      target: "users",
      target_id: userId,
      description: `User id ${userId} updated their details.`,
      timestamp: fieldsToUpdate.updatedAt,
    });

    const snapshot = await usersRef.child(userId).once("value");
    const updatedUser = snapshot.val();

    res.status(200).json({ success: true, data: { id: userId, ...updatedUser } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message || 'Update failed' });
  }
};

// Helper: create JWT and send cookie
const sendTokenResponse = (userId, userData, statusCode, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") options.secure = true;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user_info: { id: userId, ...userData },
    token,
  });
};
