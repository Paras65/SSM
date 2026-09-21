/**
 * emailService.js — Centralized email dispatch service (Nodemailer / Gmail SMTP)
 *
 * All outbound emails for SSM ERP pass through this module.
 * Configured via environment variables — no secrets in code.
 *
 * SMTP credentials required (set in hosting dashboard):
 *   EMAIL_HOST     - SMTP host  (e.g. smtp.gmail.com)
 *   EMAIL_PORT     - SMTP port  (e.g. 587)
 *   EMAIL_USER     - Sender address (e.g. yourschool@gmail.com)
 *   EMAIL_PASS     - App password (Gmail: Settings → Security → App Passwords)
 *   EMAIL_FROM     - Display name (e.g. "सरस्वती शिशु मंदिर ERP")
 *
 * If any of EMAIL_HOST / EMAIL_USER / EMAIL_PASS are missing,
 * all send attempts are silently skipped (no crash, no error).
 */

'use strict';

const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || `सरस्वती शिशु मंदिर ERP <${EMAIL_USER}>`;

/** Returns true if SMTP is configured */
function isEmailConfigured() {
  return Boolean(EMAIL_HOST && EMAIL_USER && EMAIL_PASS);
}

/** Lazy singleton transporter — created only when needed */
let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
  }
  return _transporter;
}

/**
 * sendMail — Generic fire-and-forget mailer.
 * Never throws; returns { sent: true } or { sent: false, reason }.
 *
 * @param {object} opts
 * @param {string} opts.to         - Recipient email address
 * @param {string} opts.subject    - Email subject
 * @param {string} opts.html       - HTML body
 * @param {string} [opts.text]     - Plain-text fallback (auto-generated if omitted)
 */
async function sendMail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'EMAIL_NOT_CONFIGURED' };
  }
  if (!to || !to.includes('@')) {
    return { sent: false, reason: 'INVALID_RECIPIENT' };
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    });
    return { sent: true };
  } catch (err) {
    // Non-blocking: log but never propagate
    if (process.env.NODE_ENV !== 'test') {
      console.error('[EmailService] sendMail failed:', err.message);
    }
    return { sent: false, reason: err.message };
  }
}

/**
 * sendFeeReceiptEmail — sends a formatted fee receipt to parent/guardian.
 *
 * @param {object} opts
 * @param {string} opts.to             - Parent email address
 * @param {string} opts.studentName    - Student's full name
 * @param {string} opts.fatherName     - Father's name
 * @param {string} opts.className      - Class (e.g. "Class 5")
 * @param {string} opts.section        - Section (e.g. "A")
 * @param {string} opts.rollNo         - Roll number
 * @param {string} opts.receiptNo      - Auto-generated receipt number
 * @param {number} opts.amountPaid     - Amount collected this transaction (₹)
 * @param {number} opts.totalAmount    - Total fee amount (₹)
 * @param {number} opts.paidAmount     - Cumulative paid after this transaction (₹)
 * @param {string} opts.term           - Fee term (e.g. "Term 1")
 * @param {string} opts.paymentMode    - Payment mode (Cash / UPI / Cheque etc.)
 * @param {string} opts.academicYear   - Academic year (e.g. "2025-26")
 * @param {string} opts.schoolHindiName- School's Hindi name
 * @param {string} opts.schoolName     - School's English name
 * @param {string} opts.paidDate       - Date of payment (YYYY-MM-DD)
 * @param {string} opts.status         - Payment status (Paid / Partial / Under Clearance)
 */
async function sendFeeReceiptEmail(opts) {
  const {
    to, studentName, fatherName, className, section, rollNo,
    receiptNo, amountPaid, totalAmount, paidAmount, term,
    paymentMode, academicYear, schoolHindiName, schoolName,
    paidDate, status
  } = opts;

  const pending = Math.max(0, totalAmount - paidAmount);
  const statusLabel = status === 'Paid' ? '✅ पूर्ण भुगतान (Paid)' : status === 'Partial' ? '⚠️ आंशिक भुगतान (Partial)' : '🔄 समाशोधनाधीन (Under Clearance)';

  const html = `
<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>शुल्क रसीद — ${receiptNo}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
  .container { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #7c2d12, #c2410c); color: white; padding: 28px 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 900; }
  .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: bold; margin-top: 8px; letter-spacing: 0.5px; }
  .body { padding: 24px; }
  .receipt-no { text-align: center; background: #fff7ed; border: 2px dashed #fb923c; border-radius: 12px; padding: 12px; margin-bottom: 20px; }
  .receipt-no .label { font-size: 11px; color: #9a3412; font-weight: bold; text-transform: uppercase; }
  .receipt-no .value { font-size: 18px; font-weight: 900; color: #7c2d12; font-family: monospace; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 9px 12px; border-bottom: 1px solid #f3f0eb; }
  td:first-child { color: #78716c; font-weight: 600; width: 45%; }
  td:last-child { color: #1c1917; font-weight: 700; }
  .amount-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; }
  .amount-box .amount { font-size: 32px; font-weight: 900; color: #15803d; }
  .amount-box .sublabel { font-size: 12px; color: #166534; margin-top: 4px; }
  .pending { color: #b91c1c; font-size: 13px; text-align: center; margin-top: 6px; font-weight: 600; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${status === 'Paid' ? '#dcfce7' : status === 'Partial' ? '#fef9c3' : '#dbeafe'}; color: ${status === 'Paid' ? '#15803d' : status === 'Partial' ? '#a16207' : '#1d4ed8'}; }
  .footer { background: #fafaf9; border-top: 1px solid #e7e5e4; padding: 16px 24px; text-align: center; font-size: 11px; color: #78716c; }
  .footer strong { color: #44403c; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🏫 ${schoolHindiName}</h1>
    <p>${schoolName}</p>
    <div class="badge">📄 आधिकारिक शुल्क रसीद</div>
  </div>
  <div class="body">
    <div class="receipt-no">
      <div class="label">रसीद संख्या</div>
      <div class="value">${receiptNo}</div>
    </div>
    <table>
      <tr><td>छात्र / छात्रा का नाम</td><td>${studentName}</td></tr>
      <tr><td>पिता का नाम</td><td>${fatherName || '—'}</td></tr>
      <tr><td>कक्षा / अनुक्रमांक</td><td>${className} - ${section} | रोल: ${rollNo}</td></tr>
      <tr><td>शुल्क मद (Term)</td><td>${term}</td></tr>
      <tr><td>शैक्षणिक सत्र</td><td>${academicYear}</td></tr>
      <tr><td>भुगतान माध्यम</td><td>${paymentMode}</td></tr>
      <tr><td>भुगतान दिनांक</td><td>${paidDate}</td></tr>
      <tr><td>स्थिति</td><td><span class="status-badge">${statusLabel}</span></td></tr>
    </table>
    <div class="amount-box">
      <div class="amount">₹${amountPaid.toLocaleString('en-IN')}</div>
      <div class="sublabel">इस लेनदेन में प्राप्त राशि</div>
    </div>
    ${pending > 0 ? `<div class="pending">⚠️ शेष बकाया राशि: ₹${pending.toLocaleString('en-IN')}</div>` : '<div style="color:#15803d;text-align:center;font-weight:700;font-size:13px;">✅ समस्त शुल्क चुकता — कोई बकाया नहीं</div>'}
  </div>
  <div class="footer">
    यह एक स्वचालित डिजिटल रसीद है। किसी समस्या के लिए विद्यालय से संपर्क करें।<br/>
    <strong>Powered by सरस्वती शिशु मंदिर ERP — init65.co.in</strong>
  </div>
</div>
</body>
</html>`;

  return sendMail({
    to,
    subject: `📄 शुल्क रसीद: ${receiptNo} — ${studentName} (${className}-${section}) | ${schoolHindiName}`,
    html
  });
}

/**
 * Extracts a clean email address from EMAIL_FROM or EMAIL_USER
 */
function getEffectiveSenderEmail() {
  const fromStr = process.env.EMAIL_FROM || EMAIL_FROM || '';
  const userStr = process.env.EMAIL_USER || EMAIL_USER || '';

  // 1. Extract email from angle brackets: e.g. "सरस्वती शिशु मंदिर ERP <support@init65.co.in>"
  const angleMatch = fromStr.match(/<([^>]+)>/);
  if (angleMatch && angleMatch[1] && angleMatch[1].includes('@')) {
    return angleMatch[1].trim();
  }

  // 2. Extract plain email from EMAIL_FROM: e.g. "support@init65.co.in"
  const emailMatch = fromStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    return emailMatch[0].trim();
  }

  // 3. Fall back to EMAIL_USER if it has an '@' (e.g. standard Gmail)
  if (userStr.includes('@')) {
    return userStr.trim();
  }

  // 4. Return username or from string as fallback
  return userStr.trim() || fromStr.trim() || '';
}

function maskEmail(emailOrUser) {
  if (!emailOrUser) return '';
  const str = emailOrUser.trim();
  if (str.includes('@')) {
    const [local, domain] = str.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  }
  // For API keys / usernames without '@' (e.g. 'emailapikey' in ZeptoMail/SendGrid)
  if (str.length <= 4) return `${str.slice(0, 1)}***`;
  return `${str.slice(0, 2)}***${str.slice(-2)}`;
}

/**
 * Returns safe SMTP diagnostic details for Developer Dashboard
 */
function getEmailDiagnosticInfo() {
  const configured = isEmailConfigured();
  const effectiveSender = getEffectiveSenderEmail();
  return {
    configured,
    host: EMAIL_HOST || 'Not Configured',
    port: EMAIL_PORT,
    sender: configured ? maskEmail(effectiveSender) : ''
  };
}

/**
 * Sends a branded SMTP connectivity test email
 */
async function sendTestEmail({ to, requestedBy = 'Super Admin' }) {
  const timeStr = new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' });
  const html = `
<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8"/>
<title>SSM ERP — SMTP टेस्ट ईमेल</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fefce8; margin: 0; padding: 20px; }
  .container { max-width: 540px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #fef08a; }
  .header { background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 24px; text-align: center; }
  .body { padding: 24px; }
  .badge { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: bold; }
  .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; }
  .details table { width: 100%; border-collapse: collapse; }
  .details td { padding: 6px 0; }
  .details td:first-child { color: #64748b; width: 40%; font-weight: 600; }
  .details td:last-child { color: #0f172a; font-weight: 700; }
  .footer { background: #fafaf9; border-top: 1px solid #f3f4f6; padding: 14px 24px; text-align: center; font-size: 11px; color: #78716c; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0;font-size:20px;">🪷 सरस्वती शिशु मंदिर ERP</h2>
    <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">केंद्रीय SMTP सेवा परीक्षण (Diagnostic Test)</p>
  </div>
  <div class="body">
    <div style="text-align:center;margin-bottom:16px;">
      <span class="badge">✅ SMTP सर्वर सफलतापूर्वक कनेक्टेड</span>
    </div>
    <p style="font-size:13px;color:#334155;line-height:1.6;margin:0 0 12px;">
      यह एक स्वचालित परीक्षण ईमेल है। यदि आपको यह संदेश प्राप्त हुआ है, तो इसका अर्थ है कि आपका <strong>SMTP मेल सर्वर एवं Google App Password</strong> पूर्णतः कार्यशील है।
    </p>
    <div class="details">
      <table>
        <tr><td>परीक्षण समय</td><td>${timeStr} IST</td></tr>
        <tr><td>अनुरोधकर्ता</td><td>${requestedBy}</td></tr>
        <tr><td>SMTP होस्ट</td><td>${EMAIL_HOST} (Port: ${EMAIL_PORT})</td></tr>
        <tr><td>प्रेषक खाता</td><td>${maskEmail(getEffectiveSenderEmail())}</td></tr>
      </table>
    </div>
    <p style="font-size:12px;color:#64748b;margin:0;">
      अब आपकी अधिकृत विद्यालय शाखाएं अभिभावकों को डिजिटल शुल्क रसीदें ईमेल द्वारा स्वतः भेज सकती हैं।
    </p>
  </div>
  <div class="footer">
    सरस्वती शिशु मंदिर विद्यालयी प्रबंधन प्रणाली • <strong>init65.co.in</strong>
  </div>
</div>
</body>
</html>`;

  return sendMail({
    to,
    subject: `✅ [परीक्षण सफल] सरस्वती शिशु मंदिर ERP — SMTP ईमेल सेवा जांच (${timeStr})`,
    html
  });
}

module.exports = {
  isEmailConfigured,
  sendMail,
  sendFeeReceiptEmail,
  getEmailDiagnosticInfo,
  sendTestEmail
};

