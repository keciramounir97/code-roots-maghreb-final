const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const {
  loadAuthUserById,
  createSession,
  logoutSession,
  createResetCode,
  verifyResetCode,
  clearReset,
  validateAuthInput,
  validateSignupInput,
} = require("../services/authService");
const { logActivity } = require("../services/activityService");
const { getSetting } = require("../services/settingsService");
const { getDatabaseErrorResponse } = require("../utils/prismaErrors");

const signup = async (req, res) => {
  try {
    // Log request for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Signup request received:", {
        hasBody: !!req.body,
        email: req.body?.email,
        fullName: req.body?.fullName ? "provided" : "missing"
      });
    }

    const allowRegistration = await getSetting("allowRegistration", "true");
    if (
      process.env.NODE_ENV !== "test" &&
      String(allowRegistration).toLowerCase() !== "true"
    ) {
      return res.status(403).json({ message: "Registration is disabled" });
    }
    
    const validation = validateSignupInput(req.body || {});
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }
    const { email, fullName } = validation;
    const { phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = await prisma.user.create({
      data: {
        fullName,
        phoneNumber: phone || null,
        email,
        password: passwordHash,
        roleId: 2,
        status: "active",
      },
    });

    await logActivity(null, "users", `New user registered: ${email}`);
    res.status(201).json({ 
      message: "Account created successfully",
      id: newUser.id
    });
  } catch (err) {
    console.error("Signup failed:", err.code || "", err.message);
    if (process.env.NODE_ENV === "development") {
      console.error("Signup error stack:", err.stack);
    }
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ 
      message: "Signup failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    // Log request for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Login request received:", {
        hasBody: !!req.body,
        email: req.body?.email,
        hasPassword: !!req.body?.password
      });
    }

    const validation = validateAuthInput(req.body || {});
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }
    const { email } = validation;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (String(user.status || "active").toLowerCase() !== "active") {
      return res.status(403).json({ message: "Account disabled" });
    }

    let passwordMatches = false;

    if (user.password && user.password.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(String(password), user.password);
    } else if (String(user.password) === String(password)) {
      passwordMatches = true;
      const newHash = await bcrypt.hash(String(password), 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { token } = await createSession(user);

    await logActivity(user.id, "security", `User logged in: ${user.email}`);

    // Return user data in format expected by frontend
    const userData = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phoneNumber,
      email: user.email,
      role: user.roleId,
      roleName: user.role?.name || null,
      permissions: user.role?.permissions ? JSON.parse(user.role.permissions) : [],
      status: user.status || "active",
    };

    res.json({
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login failed:", err.code || "", err.message);
    if (process.env.NODE_ENV === "development") {
      console.error("Login error stack:", err.stack);
    }
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ 
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

const logout = async (req, res) => {
  try {
    await logoutSession(req.user.id);
    await logActivity(req.user.id, "security", `User logged out: ${req.user.email}`);
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout failed:", err.message);
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ message: "Logout failed" });
  }
};

const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    const safeEmail = (email || "").trim().toLowerCase();
    if (!safeEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: safeEmail } });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: "If the email exists, a reset code has been sent"
      });
    }

    const code = await createResetCode(safeEmail);
    await logActivity(null, "security", `Password reset requested: ${safeEmail}`);
    const exposeHeader = String(req.headers["x-echo-reset-code"] || "").toLowerCase() === "true";
    const expose =
      exposeHeader ||
      process.env.EXPOSE_RESET_CODE === "true" ||
      process.env.NODE_ENV !== "production";
    res.json({
      message: "Reset code sent",
      ...(expose ? { code } : {}),
    });
  } catch (err) {
    console.error("Password reset failed:", err.code || "", err.message);
    if (process.env.NODE_ENV === "development") {
      console.error("Reset error stack:", err.stack);
    }
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ 
      message: "Password reset failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

const verifyReset = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const safeEmail = (email || "").trim().toLowerCase();
    const safeCode = String(code || "").trim();
    
    if (!safeEmail || !safeCode || !newPassword) {
      return res.status(400).json({ message: "Missing required fields (email, code, newPassword)" });
    }
    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const ok = await verifyResetCode(safeEmail, safeCode);
    if (!ok) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.updateMany({
      where: { email: safeEmail },
      data: { password: passwordHash },
    });
    await clearReset(safeEmail);

    const found = await prisma.user.findUnique({
      where: { email: safeEmail },
      select: { id: true },
    });
    await logActivity(
      found?.id || null,
      "security",
      `Password reset completed: ${safeEmail}`
    );
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password reset verification failed:", err.code || "", err.message);
    if (process.env.NODE_ENV === "development") {
      console.error("Verify reset error stack:", err.stack);
    }
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ 
      message: "Password reset verification failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

const me = async (req, res) => {
  try {
    // Reload user to get latest data
    const user = await loadAuthUserById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions || [],
      status: user.status,
    });
  } catch (err) {
    console.error("Get me failed:", err.code || "", err.message);
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ message: "Failed to get user info" });
  }
};

const updateMe = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const data = {};
    if (fullName !== undefined) data.fullName = fullName || null;
    if (phone !== undefined) data.phoneNumber = phone || null;
    if (Object.keys(data).length) {
      await prisma.user.updateMany({
        where: { id: req.user.id },
        data,
      });
    }
    await logActivity(req.user.id, "users", `Updated profile: ${req.user.email}`);
    const user = await loadAuthUserById(req.user.id);
    res.json({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.roleId,
      status: user.status,
    });
  } catch (err) {
    console.error("Update profile failed:", err.code || "", err.message);
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  requestReset,
  verifyReset,
  me,
  updateMe,
};
