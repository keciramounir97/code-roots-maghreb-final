const { getSetting, setSetting } = require("../services/settingsService");
const { logActivity } = require("../services/activityService");
const { getDatabaseErrorResponse } = require("../utils/prismaErrors");

const getSettings = async (_req, res) => {
  const allowRegistration = await getSetting("allowRegistration", "true");
  const defaultLanguage = await getSetting("defaultLanguage", "en");
  const notifyAdmins = await getSetting("notifyAdmins", "true");
  const activityRetentionDays = await getSetting("activityRetentionDays", "90");
  res.json({
    allowRegistration: String(allowRegistration).toLowerCase() === "true",
    defaultLanguage,
    notifyAdmins: String(notifyAdmins).toLowerCase() === "true",
    activityRetentionDays: Number(activityRetentionDays) || 90,
  });
};

const saveSettings = async (req, res) => {
  try {
    const {
      allowRegistration,
      defaultLanguage,
      notifyAdmins,
      activityRetentionDays,
    } = req.body || {};

    if (typeof allowRegistration === "boolean") {
      await setSetting("allowRegistration", allowRegistration);
    }
    if (typeof defaultLanguage === "string") {
      await setSetting("defaultLanguage", defaultLanguage);
    }
    if (typeof notifyAdmins === "boolean") {
      await setSetting("notifyAdmins", notifyAdmins);
    }
    if (typeof activityRetentionDays === "number") {
      await setSetting("activityRetentionDays", activityRetentionDays);
    }

    await logActivity(req.user.id, "security", "Updated settings");
    res.json({ message: "Settings saved" });
  } catch (err) {
    console.error("Save settings failed:", err.code || "", err.message);
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ message: "Save settings failed" });
  }
};

module.exports = { getSettings, saveSettings };
