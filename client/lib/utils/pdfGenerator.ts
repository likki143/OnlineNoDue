import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Application } from "../applicationStore";
import { settingsStore } from "../settingsStore";

// Generate QR Code as data URL
const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 150,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
};

// Generate No Due Certificate PDF
export const generateCertificatePDF = async (
  application: Application,
): Promise<void> => {
  try {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Certificate verification URL - use current domain
    const currentDomain = window.location.origin;
    const verificationURL = `${currentDomain}/verify/${application.id}`;
    const qrCodeDataURL = await generateQRCode(verificationURL);

    // Get current settings
    const settings = settingsStore.getSettings();

    // Set up fonts and colors
    pdf.setFont("helvetica");

    // Header - Institution Name from settings
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(33, 37, 41); // Dark color
    pdf.text(settings.institutionName.toUpperCase(), pageWidth / 2, 30, { align: "center" });

    // Subtitle
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(108, 117, 125); // Muted color
    pdf.text("Office of Student Affairs", pageWidth / 2, 40, {
      align: "center",
    });

    // Title
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(13, 110, 253); // Primary blue
    pdf.text("NO DUE CERTIFICATE", pageWidth / 2, 60, { align: "center" });

    // Decorative line
    pdf.setLineWidth(2);
    pdf.setDrawColor(13, 110, 253);
    pdf.line(40, 70, pageWidth - 40, 70);

    // Certificate body
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33, 37, 41);

    const bodyText = [
      "This is to certify that",
      "",
      `${application.studentName.toUpperCase()}`,
      "",
      `Roll Number: ${application.rollNumber}`,
      `Department: ${application.department}`,
      `Course: ${application.course} - ${application.year}`,
      "",
      "has successfully completed all clearance requirements and has",
      "NO PENDING DUES with any department of this institution.",
      "",
      "All departmental clearances have been obtained from:",
      "• Library Department",
      "• Hostel Administration",
      "• Accounts Department",
      "• Laboratory/Academic Department",
      "• Sports Department",
      "",
      "This certificate is issued for official purposes and is valid",
      "for all future references.",
    ];

    let yPosition = 85;
    bodyText.forEach((line, index) => {
      if (line === application.studentName.toUpperCase()) {
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(13, 110, 253);
      } else if (
        line.startsWith("Roll Number:") ||
        line.startsWith("Department:") ||
        line.startsWith("Course:")
      ) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(108, 117, 125);
      } else if (line.startsWith("•")) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(108, 117, 125);
      } else {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(33, 37, 41);
      }

      pdf.text(line, pageWidth / 2, yPosition, { align: "center" });
      yPosition += line === "" ? 3 : 6;
    });

    // Add QR Code
    if (qrCodeDataURL) {
      pdf.addImage(qrCodeDataURL, "PNG", pageWidth - 60, 180, 40, 40);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(108, 117, 125);
      pdf.text("Scan to verify", pageWidth - 40, 230, { align: "center" });
    }

    // Certificate details
    const issueDate = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(108, 117, 125);

    // Left side - Issue details
    pdf.text(`Certificate ID: ${application.id}`, 40, 240);
    pdf.text(`Issue Date: ${issueDate}`, 40, 248);
    pdf.text(`Application Date: ${application.submissionDate}`, 40, 256);

    // Digital signature area
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(33, 37, 41);
    pdf.text("Registrar", 40, 280);
    pdf.text(settings.institutionName, 40, 288);

    // Verification notice
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(108, 117, 125);
    const verificationText = `This is a digitally generated certificate. Verify authenticity by scanning QR code or visit: ${verificationURL}`;
    pdf.text(verificationText, pageWidth / 2, pageHeight - 20, {
      align: "center",
      maxWidth: pageWidth - 40,
    });

    // Download the PDF
    pdf.save(
      `no_due_certificate_${application.rollNumber}_${application.id}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF certificate:", error);
    throw new Error("Failed to generate certificate PDF");
  }
};

// Generate Sample Forms PDF
export const generateSampleFormsPDF = (): void => {
  try {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(13, 110, 253);
    pdf.text("NO DUE APPLICATION FORM", pageWidth / 2, 20, { align: "center" });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(108, 117, 125);
    pdf.text("Sample Form & Instructions", pageWidth / 2, 30, {
      align: "center",
    });

    // Content
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33, 37, 41);

    const formContent = [
      "STUDENT INFORMATION:",
      "• Full Name: ____________________________",
      "• Roll Number/Student ID: _______________",
      "• Email Address: ________________________",
      "• Phone Number: ________________________",
      "• Department/Branch: ____________________",
      "• Course (B.Tech/MBA/etc.): ______________",
      "• Year/Semester: _______________________",
      "",
      "REQUIRED DOCUMENTS:",
      "□ Student ID Card (Scanned Copy)",
      "□ Latest Fee Payment Receipt",
      "□ Library Clearance Certificate",
      "□ Hostel Documents (if applicable)",
      "□ Any other department-specific documents",
      "",
      "DEPARTMENT CLEARANCES REQUIRED:",
      "□ Library Department",
      "□ Hostel Administration",
      "□ Accounts Department",
      "□ Laboratory/Academic Department",
      "□ Sports Department",
      "",
      "INSTRUCTIONS:",
      "1. Fill all required fields accurately",
      "2. Upload clear, readable document copies",
      "3. Submit the online form through the portal",
      "4. Track your application status in real-time",
      "5. Contact department officers for queries",
      "6. Download certificate once fully approved",
      "",
      "IMPORTANT NOTES:",
      "• Submit applications at least 15 days before needed",
      "• Ensure all dues are cleared before applying",
      "• Keep digital copies of all documents",
      "• Certificate will have QR code for verification",
      "",
      "SUPPORT:",
      "Technical Support: support@university.edu",
      "Application Help: registrar@university.edu",
      "Emergency Contact: +1-234-567-8900",
    ];

    let yPosition = 45;
    formContent.forEach((line) => {
      if (
        line.endsWith(":") &&
        !line.startsWith("•") &&
        !line.startsWith("□")
      ) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(13, 110, 253);
      } else if (line.startsWith("•") || line.startsWith("□")) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(108, 117, 125);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(33, 37, 41);
      }

      pdf.text(line, 20, yPosition);
      yPosition += line === "" ? 4 : 6;
    });

    pdf.save("no_due_application_form_sample.pdf");
  } catch (error) {
    console.error("Error generating forms PDF:", error);
    throw new Error("Failed to generate forms PDF");
  }
};

// Generate Guidelines PDF
export const generateGuidelinesPDF = (): void => {
  try {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(13, 110, 253);
    pdf.text("NO DUE SYSTEM GUIDELINES", pageWidth / 2, 20, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(108, 117, 125);
    pdf.text("Complete Guide for Students", pageWidth / 2, 30, {
      align: "center",
    });

    // Content
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33, 37, 41);

    const guidelines = [
      "GETTING STARTED:",
      "• Register with your institutional email ID",
      "• Verify your email before first login",
      "• Complete your profile information",
      "• Ensure contact details are up-to-date",
      "",
      "APPLICATION PROCESS:",
      "1. Login to the No Due System portal",
      '2. Click "Submit New Application"',
      "3. Fill all required information accurately",
      "4. Upload necessary documents in clear quality",
      "5. Review and submit your application",
      "6. Note your application ID for future reference",
      "",
      "REQUIRED CLEARANCES:",
      "LIBRARY DEPARTMENT:",
      "• Return all borrowed books",
      "• Pay any pending fines",
      "• Clear any equipment dues",
      "",
      "HOSTEL ADMINISTRATION:",
      "• Complete room vacation process",
      "• Return room keys and furniture",
      "• Pay any pending hostel dues",
      "",
      "ACCOUNTS DEPARTMENT:",
      "• Clear all tuition fee dues",
      "• Pay examination fees",
      "• Settle any miscellaneous charges",
      "",
      "LABORATORY/ACADEMIC:",
      "• Return all lab equipment",
      "• Submit pending assignments/projects",
      "• Clear any breakage charges",
      "",
      "SPORTS DEPARTMENT:",
      "• Return sports equipment",
      "• Clear any sports facility dues",
      "",
      "TRACKING YOUR APPLICATION:",
      "• Use dashboard to check real-time status",
      "• Each department shows progress dots",
      "• Green = Approved, Red = Rejected, Yellow = Pending",
      "• You will receive email notifications",
      "",
      "COMMON ISSUES & SOLUTIONS:",
      "Application Stuck:",
      "• Contact specific department officer",
      "• Check for pending dues or requirements",
      "",
      "Document Issues:",
      "• Ensure files are clear and readable",
      "• Use PDF or high-quality image formats",
      "• File size should be under 5MB",
      "",
      "Login Problems:",
      "• Verify your email first",
      "• Use forgot password if needed",
      "• Contact support for account issues",
      "",
      "IMPORTANT DEADLINES:",
      "• Submit applications 15 days before needed",
      "• Respond to department queries within 3 days",
      "• Download certificate within 30 days of approval",
      "",
      "CONTACT INFORMATION:",
      "System Support: support@university.edu",
      "Registrar Office: registrar@university.edu",
      "Emergency: +1-234-567-8900",
    ];

    let yPosition = 45;
    guidelines.forEach((line) => {
      // Check if we need a new page
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      if (
        line.endsWith(":") &&
        !line.startsWith("•") &&
        !line.includes("DEPARTMENT")
      ) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(13, 110, 253);
        pdf.setFontSize(11);
      } else if (line.includes("DEPARTMENT:")) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(220, 53, 69);
        pdf.setFontSize(10);
      } else if (line.startsWith("•") || line.match(/^\d+\./)) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(108, 117, 125);
        pdf.setFontSize(10);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(33, 37, 41);
        pdf.setFontSize(10);
      }

      pdf.text(line, 20, yPosition, { maxWidth: pageWidth - 40 });
      yPosition += line === "" ? 4 : 5;
    });

    pdf.save("no_due_system_guidelines.pdf");
  } catch (error) {
    console.error("Error generating guidelines PDF:", error);
    throw new Error("Failed to generate guidelines PDF");
  }
};
