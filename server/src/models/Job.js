const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    summary: { type: String, default: "" },
    department: String,
    jobType: String,
    workplaceType: String,

    location: String,
    experience: String,

    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },

    skills: [String],

    deadline: Date,

    description: String,
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    createdBySource: {
      type: String,
      enum: ["CRM", "CLIENT"],
      default: "CRM",
    },
    createdByCRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmUser",
      default: null,
    },
    createdByClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    publishedByCRMAt: {
      type: Date,
      default: null,
    },
    packageSlotCount: {
      type: Number,
      default: 1,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

jobSchema.index({ companyId: 1, isActive: 1 });

module.exports = mongoose.model("Job", jobSchema);
