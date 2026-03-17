const QRCode = require("../models/QRCode");
const Job = require("../models/Job");

exports.getLandingPageData = async (req, res) => {
  try {
    const { token } = req.params;

    const qr = await QRCode.findOne({
      token,
      isActive: true,
    }).populate("companyId");

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired QR",
      });
    }

    // 🚨 IMPORTANT FIX
    if (!qr.companyId) {
      return res.status(404).json({
        success: false,
        message: "Company not found for this QR",
      });
    }

    const company = qr.companyId;

    const jobs = await Job.find({
      companyId: company._id,
      isActive: true,
    });

    qr.scans += 1;
    await qr.save();

    return res.json({
      success: true,
      data: {
        candidateWebUrl: process.env.CANDIDATE_WEB_URL || process.env.FRONTEND_URL || "",
        company: {
          ...company.toObject(),
          jobs,
        },
        scans: qr.scans,
      },
    });
  } catch (error) {
    console.error("Landing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch landing data",
    });
  }
};
