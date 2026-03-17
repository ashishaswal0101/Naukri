const PDFDocument = require("pdfkit");
const axios = require("axios");

async function fetchImage(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

/**
 * Sanitize text for PDFKit's WinAnsiEncoding (built-in Helvetica/Times).
 * Replaces common Unicode symbols with ASCII equivalents, then strips any
 * remaining characters outside the WinAnsi range (0x00-0xFF).
 */
function sanitize(str) {
  if (!str) return "";

  return String(str)
    .replace(/[\u2018\u2019\u0060]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022|\u2023|\u25CF/g, "-")
    .replace(/\u25BA/g, ">")
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2713|\u2714/g, "(ok)")
    .replace(/\u2715|\u2716/g, "(x)")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2000}-\u{206F}]/gu, " ")
    .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
    .replace(/[^\x00-\xFF]/g, "")
    .replace(/  +/g, " ")
    .trim();
}

exports.generateCompanyQRPDF = async ({ company, jobs = [], qrImageUrl }) => {
  void jobs;

  const PAGE_W = 595.28; // A4 width in points
  const PAGE_H = 841.89; // A4 height in points
  const MARGIN = 56;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const doc = new PDFDocument({ size: "A4", margin: 0 });

  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const pdfDone = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers))),
  );

  const qrBuffer = await fetchImage(qrImageUrl);

  const companyName = sanitize(company?.name) || "Client";
  const tagline = sanitize(company?.tagline);

  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(28).text(companyName, MARGIN, 86, {
    width: CONTENT_W,
    align: "center",
  });

  if (tagline) {
    doc
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(12)
      .text(tagline, MARGIN, doc.y + 14, { width: CONTENT_W, align: "center" });
  }

  const QR_SIZE = 260;
  const qrX = (PAGE_W - QR_SIZE) / 2;
  const qrY = (PAGE_H - QR_SIZE) / 2 - 10;

  doc.roundedRect(qrX - 14, qrY - 14, QR_SIZE + 28, QR_SIZE + 28, 18).fill("#ffffff");
  doc.roundedRect(qrX - 14, qrY - 14, QR_SIZE + 28, QR_SIZE + 28, 18).lineWidth(1).stroke("#e2e8f0");
  doc.image(qrBuffer, qrX, qrY, { width: QR_SIZE, height: QR_SIZE });

  doc
    .fillColor("#64748b")
    .font("Helvetica")
    .fontSize(11)
    .text("Powered by Maven Jobs", MARGIN, PAGE_H - 84, { width: CONTENT_W, align: "center" });

  doc.end();

  return pdfDone;
};

