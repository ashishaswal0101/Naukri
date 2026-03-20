const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async.middleware");
const User = require("../models/User");
const Job = require("../models/Job");
const QRCode = require("../models/QRCode");
const Application = require("../models/Application");
const CandidateProfile = require("../models/CandidateProfile");
const CandidateProfileHistory = require("../models/CandidateProfileHistory");
const CandidateNotification = require("../models/CandidateNotification");
const { uploadResumeFile } = require("../services/resume-storage.service");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const supportedResumeMimeTypes = new Set([
  "application/pdf"
]);

const isValidPhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const generateToken = (id) =>
  jwt.sign({ id, type: "CANDIDATE_PANEL" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const formatRelativeTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const computeProfileCompletion = (profile, user) => {
  const checkpoints = [
    user?.name,
    user?.email,
    profile.phone,
    profile.headline,
    profile.summary,
    profile.totalExperience,
    profile.currentCity,
    profile.skills?.length,
    profile.preferredRoles?.length,
    profile.resume?.url,
  ];

  return Math.round((checkpoints.filter(Boolean).length / checkpoints.length) * 100);
};

const formatCandidateUser = (user = null) => ({
  id: String(user?._id || ""),
  name: user?.name || "",
  email: user?.email || "",
  role: user?.role || "CANDIDATE",
  designation: user?.department || "",
  accessStatus: user?.accessStatus || "ACTIVE",
});

const formatProfile = (profile = {}, user = null) => ({
  id: String(profile?._id || ""),
  user: formatCandidateUser(user),
  phone: profile?.phone || "",
  altPhone: profile?.altPhone || "",
  headline: profile?.headline || "",
  summary: profile?.summary || "",
  totalExperience: profile?.totalExperience || "",
  currentTitle: profile?.currentTitle || user?.department || "",
  currentCompany: profile?.currentCompany || "",
  noticePeriod: profile?.noticePeriod || "",
  currentCity: profile?.currentCity || "",
  currentState: profile?.currentState || "",
  currentCountry: profile?.currentCountry || "",
  preferredLocations: profile?.preferredLocations || [],
  preferredRoles: profile?.preferredRoles || [],
  skills: profile?.skills || [],
  linkedInUrl: profile?.linkedInUrl || "",
  portfolioUrl: profile?.portfolioUrl || "",
  expectedSalary: profile?.expectedSalary || "",
  lastScannedQrToken: profile?.lastScannedQrToken || "",
  resume: {
    fileName: profile?.resume?.fileName || "",
    url: profile?.resume?.url || "",
    storageProvider: profile?.resume?.storageProvider || "",
    sizeBytes: Number(profile?.resume?.sizeBytes || 0),
    mimeType: profile?.resume?.mimeType || "",
    uploadedAt: profile?.resume?.uploadedAt || null,
  },
  profileCompletion: computeProfileCompletion(profile || {}, user || {}),
  updatedAt: profile?.updatedAt,
  lastUpdated: formatRelativeTime(profile?.updatedAt),
});

const formatJob = (job, applicationMap = new Map()) => {
  const application = applicationMap.get(String(job._id));

  return {
    id: String(job._id),
    companyId: String(job.companyId?._id || job.companyId || ""),
    companyName: job.companyId?.name || "Unknown company",
    title: job.title,
    department: job.department || "General",
    jobType: job.jobType || "",
    workplaceType: job.workplaceType || "",
    location: job.location || "",
    experience: job.experience || "",
    salaryMin: Number(job.salaryMin || 0),
    salaryMax: Number(job.salaryMax || 0),
    summary: job.summary || "",
    description: job.description || "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    deadline: job.deadline || null,
    isActive: Boolean(job.isActive),
    applicationStatus: application?.status || "",
    hasApplied: Boolean(application),
    createdAt: job.createdAt,
    lastUpdated: formatRelativeTime(job.updatedAt),
  };
};

const formatApplication = (application) => ({
  id: String(application._id),
  jobId: String(application.jobId?._id || application.jobId || ""),
  jobTitle: application.jobId?.title || "Unknown job",
  companyId: String(application.companyId?._id || application.companyId || ""),
  companyName: application.companyId?.name || "Unknown company",
  status: application.status,
  resumeUrl: application.resumeUrl || "",
  resumeFileName: application.resumeFileName || "",
  sourceQrToken: application.sourceQrToken || "",
  appliedAt: application.createdAt,
  updatedAt: application.updatedAt,
  lastUpdated: formatRelativeTime(application.updatedAt),
});

const formatNotification = (notification) => ({
  id: String(notification._id),
  title: notification.title,
  message: notification.message,
  category: notification.category,
  status: notification.status,
  actionUrl: notification.actionUrl || "",
  createdAt: notification.createdAt,
  lastUpdated: formatRelativeTime(notification.updatedAt),
});

const formatHistoryItem = (entry) => ({
  id: String(entry._id),
  action: entry.action,
  changedFields: entry.changedFields || [],
  changes: entry.changes || [],
  createdAt: entry.createdAt,
  lastUpdated: formatRelativeTime(entry.createdAt),
});

const ensureCandidateProfile = async (user) => {
  let profile = await CandidateProfile.findOne({ userId: user._id });

  if (!profile) {
    profile = await CandidateProfile.create({ userId: user._id });
    await CandidateProfileHistory.create({
      candidateId: user._id,
      profileId: profile._id,
      action: "CREATE",
      changedFields: [],
      changes: [],
      actorType: "SYSTEM",
    });
  }

  if (!String(profile.currentTitle || "").trim() && String(user.department || "").trim()) {
    profile.currentTitle = String(user.department).trim();
    await profile.save();
  }

  return profile;
};

const resolveQrContext = async (token) => {
  const qrCode = await QRCode.findOne({ token, isActive: true }).populate("companyId");

  if (!qrCode || !qrCode.companyId) {
    throw createHttpError(404, "Invalid or expired QR code");
  }

  const jobs = await Job.find(
    qrCode.jobId
      ? {
          _id: qrCode.jobId,
          companyId: qrCode.companyId._id,
          isActive: true,
          approvalStatus: "APPROVED",
        }
      : {
          companyId: qrCode.companyId._id,
          isActive: true,
          approvalStatus: "APPROVED",
        },
  )
    .sort({ updatedAt: -1 })
    .populate("companyId", "name");

  return {
    qrCode,
    company: qrCode.companyId,
    jobs,
  };
};

const buildApplicationMap = async (candidateId, jobIds) => {
  if (!jobIds.length) {
    return new Map();
  }

  const applications = await Application.find({
    candidateId,
    jobId: { $in: jobIds },
  });

  return new Map(applications.map((application) => [String(application.jobId), application]));
};

const getRecommendedJobs = async (profile, candidateId) => {
  let jobs = [];
  let mappedCompany = null;

  if (profile.lastScannedQrToken) {
    try {
      const context = await resolveQrContext(profile.lastScannedQrToken);
      jobs = context.jobs;
      mappedCompany = context.company;
    } catch {
      jobs = [];
    }
  }

  if (!jobs.length) {
    const preferredRoles = profile.preferredRoles || [];
    const skills = profile.skills || [];

    const filters = [
      preferredRoles.length ? { title: { $in: preferredRoles } } : null,
      preferredRoles.length ? { department: { $in: preferredRoles } } : null,
      skills.length ? { skills: { $in: skills } } : null,
    ].filter(Boolean);

    jobs = await Job.find(
      filters.length
        ? { isActive: true, approvalStatus: "APPROVED", $or: filters }
        : { isActive: true, approvalStatus: "APPROVED" },
    )
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate("companyId", "name");
  }

  const applicationMap = await buildApplicationMap(
    candidateId,
    jobs.map((job) => job._id),
  );

  return {
    mappedCompany: mappedCompany
      ? {
          id: String(mappedCompany._id),
          name: mappedCompany.name,
          industry: mappedCompany.industry || "General",
          city: mappedCompany.location?.city || "",
          region: mappedCompany.location?.region || "",
        }
      : null,
    jobs: jobs.map((job) => formatJob(job, applicationMap)),
  };
};

const buildSimilarJobs = async (job, candidateId) => {
  const similarJobs = await Job.find({
    _id: { $ne: job._id },
    isActive: true,
    approvalStatus: "APPROVED",
    $or: [
      { companyId: job.companyId?._id || job.companyId },
      job.department ? { department: job.department } : null,
      Array.isArray(job.skills) && job.skills.length ? { skills: { $in: job.skills } } : null,
    ].filter(Boolean),
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("companyId", "name");

  const applicationMap = await buildApplicationMap(
    candidateId,
    similarJobs.map((item) => item._id),
  );

  return similarJobs.map((item) => formatJob(item, applicationMap));
};

const escapeCsvValue = (value) => {
  const normalized =
    value === null || value === undefined
      ? ""
      : Array.isArray(value)
        ? value.join(" | ")
        : String(value);

  return `"${normalized.replace(/"/g, '""')}"`;
};

const sendCsv = (res, fileName, headers, rows) => {
  const csv = [headers, ...rows]
    .map((line) => line.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
  res.status(200).send(csv);
};

exports.register = asyncHandler(async (req, res) => {
  const requestBody = req.body && typeof req.body === "object" ? req.body : {};
  const {
    name = "",
    designation = "",
    phone = "",
    email = "",
    password = "",
    qrToken = "",
  } = requestBody;

  if (!Object.keys(requestBody).length) {
    throw createHttpError(
      400,
      "Invalid registration payload. Send multipart/form-data with candidate fields and resume file.",
    );
  }

  if (!name.trim() || !designation.trim() || !phone.trim() || !email.trim() || !password.trim()) {
    throw createHttpError(
      400,
      "Name, designation, phone number, email, and password are required",
    );
  }

  if (!isValidPhoneNumber(phone)) {
    throw createHttpError(400, "Phone number must contain 10 to 15 digits");
  }

  if (req.file) {
    if (!supportedResumeMimeTypes.has(req.file.mimetype)) {
      throw createHttpError(400, "Only PDF files are supported");
    }
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createHttpError(409, "Email already exists");
  }

  let user = null;

  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "CANDIDATE",
      department: designation.trim(),
      accessStatus: "ACTIVE",
      isActive: true,
    });

    let uploadedResume = null;
    if (req.file) {
      uploadedResume = await uploadResumeFile(req.file, user._id);
    }

    const profileData = {
      userId: user._id,
      phone: phone.trim(),
      currentTitle: designation.trim(),
      lastScannedQrToken: qrToken.trim(),
    };

    if (uploadedResume) {
      profileData.resume = {
        ...uploadedResume,
        uploadedAt: new Date(),
      };
    }

    const profile = await CandidateProfile.create(profileData);

    const changedFields = [];
    const changes = [];

    if (designation.trim()) {
      changedFields.push("currentTitle");
      changes.push({
        field: "currentTitle",
        previousValue: "",
        nextValue: designation.trim(),
      });
    }

    if (phone.trim()) {
      changedFields.push("phone");
      changes.push({
        field: "phone",
        previousValue: "",
        nextValue: phone.trim(),
      });
    }

    if (qrToken.trim()) {
      changedFields.push("lastScannedQrToken");
      changes.push({
        field: "lastScannedQrToken",
        previousValue: "",
        nextValue: qrToken.trim(),
      });
    }

    if (uploadedResume) {
      changedFields.push("resume");
      changes.push({
        field: "resume",
        previousValue: { fileName: "", url: "" },
        nextValue: {
          fileName: uploadedResume.fileName,
          url: uploadedResume.url,
          storageProvider: uploadedResume.storageProvider,
        },
      });
    }

    await CandidateProfileHistory.create({
      candidateId: user._id,
      profileId: profile._id,
      action: "CREATE",
      changedFields,
      changes,
      actorType: "CANDIDATE",
      actorId: user._id,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatCandidateUser(user),
      profile: formatProfile(profile, user),
    });
  } catch (error) {
    if (user?._id) {
      await CandidateProfile.deleteOne({ userId: user._id }).catch(() => null);
      await CandidateProfileHistory.deleteMany({ candidateId: user._id }).catch(() => null);
      await User.deleteOne({ _id: user._id }).catch(() => null);
    }
    throw error;
  }
});

exports.login = asyncHandler(async (req, res) => {
  const requestBody = req.body && typeof req.body === "object" ? req.body : {};
  const { email = "", password = "" } = requestBody;

  if (!email.trim() || !password.trim()) {
    throw createHttpError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    role: "CANDIDATE",
  });

  if (!user) {
    throw createHttpError(404, "Candidate account not found");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (!user.isActive || user.accessStatus === "RESTRICTED") {
    throw createHttpError(403, "Candidate account is inactive");
  }

  const profile = await ensureCandidateProfile(user);

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: formatCandidateUser(user),
    profile: formatProfile(profile, user),
  });
});

exports.me = asyncHandler(async (req, res) => {
  const profile = await ensureCandidateProfile(req.user);

  res.status(200).json({
    success: true,
    user: formatCandidateUser(req.user),
    profile: formatProfile(profile, req.user),
  });
});

exports.getLanding = asyncHandler(async (req, res) => {
  const { qrCode, company, jobs } = await resolveQrContext(req.params.token);

  qrCode.scans += 1;
  await qrCode.save();

  res.status(200).json({
    success: true,
    data: {
      token: qrCode.token,
      company: {
        id: String(company._id),
        name: company.name,
        tagline: company.tagline || "",
        industry: company.industry || "",
        companySize: company.companySize || "",
        foundedYear: company.foundedYear || "",
        employeesCount: company.employeesCount || "",
        headquarters: company.headquarters || "",
        website: company.website || "",
        linkedIn: company.linkedIn || "",
        activelyHiring: Boolean(company.activelyHiring),
        openRoles: Number(company.openRoles || company.activeJobCount || 0),
        about: company.about || "",
        mission: company.mission || "",
        vision: company.vision || "",
        whyJoinUs: company.whyJoinUs || [],
        location: company.location || {},
      },
      jobs: jobs.map((job) => formatJob(job)),
      scans: qrCode.scans,
    },
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const profile = await ensureCandidateProfile(req.user);
  const [applications, notifications, recommended, applicationStats, companyIds] = await Promise.all([
    Application.find({ candidateId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate("companyId", "name")
      .populate("jobId", "title"),
    CandidateNotification.find({ candidateId: req.user._id }).sort({ createdAt: -1 }).limit(6),
    getRecommendedJobs(profile, req.user._id),
    Application.find({ candidateId: req.user._id }).select("status"),
    Application.distinct("companyId", { candidateId: req.user._id }),
  ]);

  const unreadAlerts = await CandidateNotification.countDocuments({
    candidateId: req.user._id,
    status: "UNREAD",
  });

  res.status(200).json({
    success: true,
    data: {
      profile: formatProfile(profile, req.user),
      summary: {
        totalApplications: applicationStats.length,
        shortlisted: applicationStats.filter((item) =>
          ["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(item.status),
        ).length,
        interviews: applicationStats.filter((item) =>
          ["INTERVIEW", "OFFERED", "HIRED"].includes(item.status),
        ).length,
        companiesApplied: companyIds.filter(Boolean).length,
        unreadAlerts,
      },
      mappedCompany: recommended.mappedCompany,
      recommendedJobs: recommended.jobs,
      recentApplications: applications.map((item) => formatApplication(item)),
      notifications: notifications.map((item) => formatNotification(item)),
    },
  });
});

exports.getJobs = asyncHandler(async (req, res) => {
  const profile = await ensureCandidateProfile(req.user);
  const token = String(req.query.token || "").trim();
  const search = String(req.query.search || "").trim();

  let jobs = [];
  let company = null;

  if (token) {
    const qrContext = await resolveQrContext(token);
    jobs = qrContext.jobs;
    company = qrContext.company;

    if (profile.lastScannedQrToken !== token) {
      profile.lastScannedQrToken = token;
      await profile.save();
    }
  } else {
    const query = {
      isActive: true,
      approvalStatus: "APPROVED",
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    jobs = await Job.find(query)
      .sort({ updatedAt: -1 })
      .limit(24)
      .populate("companyId", "name");
  }

  const applicationMap = await buildApplicationMap(
    req.user._id,
    jobs.map((job) => job._id),
  );

  res.status(200).json({
    success: true,
    data: {
      company: company
        ? {
            id: String(company._id),
            name: company.name,
            industry: company.industry || "",
            city: company.location?.city || "",
            region: company.location?.region || "",
          }
        : null,
      jobs: jobs.map((job) => formatJob(job, applicationMap)),
    },
  });
});

exports.getJobDetail = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("companyId", "name industry location");

  if (!job || !job.isActive || job.approvalStatus !== "APPROVED") {
    throw createHttpError(404, "Job not found");
  }

  const applicationMap = await buildApplicationMap(req.user._id, [job._id]);

  res.status(200).json({
    success: true,
    data: {
      job: formatJob(job, applicationMap),
      similarJobs: await buildSimilarJobs(job, req.user._id),
    },
  });
});

exports.getSimilarJobs = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("companyId", "name");

  if (!job || !job.isActive || job.approvalStatus !== "APPROVED") {
    throw createHttpError(404, "Job not found");
  }

  res.status(200).json({
    success: true,
    data: await buildSimilarJobs(job, req.user._id),
  });
});

exports.createApplication = asyncHandler(async (req, res) => {
  const requestBody = req.body && typeof req.body === "object" ? req.body : {};
  const { jobId = "", qrToken = "", sourceJobId = "" } = requestBody;

  if (!jobId) {
    throw createHttpError(400, "Job is required");
  }

  const profile = await ensureCandidateProfile(req.user);

  if (!profile.resume?.url) {
    throw createHttpError(400, "Upload a resume before applying");
  }

  const job = await Job.findById(jobId).populate("companyId", "name");

  if (!job || !job.isActive || job.approvalStatus !== "APPROVED") {
    throw createHttpError(404, "Job is not available for applications");
  }

  const existingApplication = await Application.findOne({
    candidateId: req.user._id,
    jobId: job._id,
  });

  if (existingApplication) {
    throw createHttpError(409, "You have already applied for this job");
  }

  const application = await Application.create({
    candidateId: req.user._id,
    companyId: job.companyId?._id || job.companyId,
    jobId: job._id,
    status: "APPLIED",
    resumeUrl: profile.resume.url,
    resumeFileName: profile.resume.fileName,
    sourceQrToken: qrToken.trim(),
    sourceJobId: sourceJobId || null,
  });

  if (qrToken.trim()) {
    profile.lastScannedQrToken = qrToken.trim();
    await profile.save();
  }

  await CandidateNotification.create({
    candidateId: req.user._id,
    companyId: job.companyId?._id || job.companyId,
    jobId: job._id,
    applicationId: application._id,
    title: "Application submitted",
    message: `Your application for ${job.title} at ${
      job.companyId?.name || "the company"
    } has been submitted successfully.`,
    category: "APPLICATION",
    actionUrl: "/candidate/applications",
  });

  const hydratedApplication = await Application.findById(application._id)
    .populate("companyId", "name")
    .populate("jobId", "title");

  res.status(201).json({
    success: true,
    data: formatApplication(hydratedApplication),
  });
});

exports.getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidateId: req.user._id })
    .sort({ updatedAt: -1 })
    .populate("companyId", "name")
    .populate("jobId", "title");

  res.status(200).json({
    success: true,
    data: applications.map((item) => formatApplication(item)),
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await ensureCandidateProfile(req.user);
  const history = await CandidateProfileHistory.find({ candidateId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json({
    success: true,
    data: {
      profile: formatProfile(profile, req.user),
      history: history.map((item) => formatHistoryItem(item)),
    },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await ensureCandidateProfile(req.user);
  const requestBody = req.body && typeof req.body === "object" ? req.body : {};
  const changes = [];

  const syncField = (field, value, transform = (item) => item) => {
    if (value === undefined) {
      return;
    }

    const nextValue = transform(value);
    const previousValue = profile[field];
    const isEqual =
      Array.isArray(previousValue) || Array.isArray(nextValue)
        ? JSON.stringify(previousValue || []) === JSON.stringify(nextValue || [])
        : String(previousValue ?? "") === String(nextValue ?? "");

    if (!isEqual) {
      changes.push({ field, previousValue, nextValue });
      profile[field] = nextValue;
    }
  };

  if (
    requestBody.name !== undefined &&
    String(requestBody.name).trim() &&
    String(requestBody.name).trim() !== req.user.name
  ) {
    changes.push({
      field: "name",
      previousValue: req.user.name,
      nextValue: String(requestBody.name).trim(),
    });
    req.user.name = String(requestBody.name).trim();
    await req.user.save();
  }

  syncField("phone", requestBody.phone, (value) => String(value).trim());
  syncField("altPhone", requestBody.altPhone, (value) => String(value).trim());
  syncField("headline", requestBody.headline, (value) => String(value).trim());
  syncField("summary", requestBody.summary, (value) => String(value).trim());
  syncField("totalExperience", requestBody.totalExperience, (value) => String(value).trim());
  syncField("currentTitle", requestBody.currentTitle, (value) => String(value).trim());
  syncField("currentCompany", requestBody.currentCompany, (value) => String(value).trim());
  syncField("noticePeriod", requestBody.noticePeriod, (value) => String(value).trim());
  syncField("currentCity", requestBody.currentCity, (value) => String(value).trim());
  syncField("currentState", requestBody.currentState, (value) => String(value).trim());
  syncField("currentCountry", requestBody.currentCountry, (value) => String(value).trim());
  syncField("preferredLocations", requestBody.preferredLocations, toArray);
  syncField("preferredRoles", requestBody.preferredRoles, toArray);
  syncField("skills", requestBody.skills, toArray);
  syncField("linkedInUrl", requestBody.linkedInUrl, (value) => String(value).trim());
  syncField("portfolioUrl", requestBody.portfolioUrl, (value) => String(value).trim());
  syncField("expectedSalary", requestBody.expectedSalary, (value) => String(value).trim());

  const nextDesignation = String(requestBody.currentTitle || "").trim();
  if (requestBody.currentTitle !== undefined && req.user.department !== nextDesignation) {
    changes.push({
      field: "designation",
      previousValue: req.user.department || "",
      nextValue: nextDesignation,
    });
    req.user.department = nextDesignation;
    await req.user.save();
  }

  if (!changes.length) {
    res.status(200).json({
      success: true,
      data: formatProfile(profile, req.user),
    });
    return;
  }

  await profile.save();
  await CandidateProfileHistory.create({
    candidateId: req.user._id,
    profileId: profile._id,
    action: "UPDATE",
    changedFields: changes.map((item) => item.field),
    changes,
    actorType: "CANDIDATE",
    actorId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: formatProfile(profile, req.user),
  });
});

exports.getProfileHistory = asyncHandler(async (req, res) => {
  const history = await CandidateProfileHistory.find({ candidateId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: history.map((item) => formatHistoryItem(item)),
  });
});

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Resume file is required");
  }

  if (!supportedResumeMimeTypes.has(req.file.mimetype)) {
    throw createHttpError(400, "Only PDF files are supported");
  }

  const profile = await ensureCandidateProfile(req.user);
  const previousResume = {
    fileName: profile.resume?.fileName || "",
    url: profile.resume?.url || "",
  };
  const uploadedResume = await uploadResumeFile(req.file, req.user._id);

  profile.resume = {
    ...uploadedResume,
    uploadedAt: new Date(),
  };
  await profile.save();

  await CandidateProfileHistory.create({
    candidateId: req.user._id,
    profileId: profile._id,
    action: "RESUME_UPLOADED",
    changedFields: ["resume"],
    changes: [
      {
        field: "resume",
        previousValue: previousResume,
        nextValue: {
          fileName: uploadedResume.fileName,
          url: uploadedResume.url,
          storageProvider: uploadedResume.storageProvider,
        },
      },
    ],
    actorType: "CANDIDATE",
    actorId: req.user._id,
  });

  await CandidateNotification.create({
    candidateId: req.user._id,
    title: "Resume updated",
    message: "Your latest resume is securely stored and ready for future applications.",
    category: "SYSTEM",
    actionUrl: "/candidate/profile",
  });

  res.status(200).json({
    success: true,
    data: formatProfile(profile, req.user),
  });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await CandidateNotification.find({ candidateId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: notifications.map((item) => formatNotification(item)),
  });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await CandidateNotification.findOne({
    _id: req.params.id,
    candidateId: req.user._id,
  });

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  notification.status = "READ";
  await notification.save();

  res.status(200).json({
    success: true,
    data: formatNotification(notification),
  });
});

exports.exportCandidateProfiles = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "CANDIDATE" }).select("name email createdAt");
  const profiles = await CandidateProfile.find({
    userId: { $in: users.map((user) => user._id) },
  });
  const applications = await Application.find({
    candidateId: { $in: users.map((user) => user._id) },
  });

  const profileMap = new Map(profiles.map((profile) => [String(profile.userId), profile]));
  const applicationCounts = new Map();

  applications.forEach((application) => {
    const candidateId = String(application.candidateId);
    applicationCounts.set(candidateId, (applicationCounts.get(candidateId) || 0) + 1);
  });

  sendCsv(
    res,
    "candidate-profiles.csv",
    [
      "Name",
      "Email",
      "Phone",
      "Experience",
      "Current Title",
      "Current Company",
      "Skills",
      "Preferred Roles",
      "City",
      "State",
      "Resume Available",
      "Applications",
      "Registered At",
    ],
    users.map((user) => {
      const profile = profileMap.get(String(user._id));

      return [
        user.name,
        user.email,
        profile?.phone || "",
        profile?.totalExperience || "",
        profile?.currentTitle || "",
        profile?.currentCompany || "",
        profile?.skills || [],
        profile?.preferredRoles || [],
        profile?.currentCity || "",
        profile?.currentState || "",
        profile?.resume?.url ? "Yes" : "No",
        applicationCounts.get(String(user._id)) || 0,
        user.createdAt,
      ];
    }),
  );
});

exports.exportCandidateResumes = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "CANDIDATE" }).select("name email");
  const profiles = await CandidateProfile.find({
    userId: { $in: users.map((user) => user._id) },
  });

  const userMap = new Map(users.map((user) => [String(user._id), user]));

  sendCsv(
    res,
    "candidate-resumes.csv",
    ["Name", "Email", "Resume File", "Storage Provider", "Resume URL", "Uploaded At"],
    profiles
      .filter((profile) => profile.resume?.url)
      .map((profile) => {
        const user = userMap.get(String(profile.userId));
        return [
          user?.name || "",
          user?.email || "",
          profile.resume?.fileName || "",
          profile.resume?.storageProvider || "",
          profile.resume?.url || "",
          profile.resume?.uploadedAt || "",
        ];
      }),
  );
});
