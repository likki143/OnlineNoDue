// Email service utility for sending department officer setup emails
// In production, this would integrate with actual email services like SendGrid, AWS SES, etc.

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface DepartmentOfficerSetupData {
  name: string;
  email: string;
  department: string;
  role: string;
  passwordResetUrl: string;
  loginUrl: string;
}

// Generate a temporary password
export const generateTemporaryPassword = (): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest with random characters (total length: 12)
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Create department officer setup email template
export const createDepartmentOfficerSetupEmail = (
  data: DepartmentOfficerSetupData,
): EmailTemplate => {
  const { name, email, department, role, passwordResetUrl, loginUrl } = data;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Department Officer Account Setup</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 No Due System</h1>
            <h2>Department Officer Account Setup</h2>
        </div>
        
        <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>Welcome to the Online No Due Form System! You have been assigned as a <strong>${role}</strong> for the <strong>${department}</strong> department.</p>
            
            <p>Your account has been created with the following details:</p>
            
            <div class="credentials-box">
                <h3>🔐 Login Credentials</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
                <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                    <li>This is a temporary password for your first login</li>
                    <li>You will be required to change your password after logging in</li>
                    <li>Do not share these credentials with anyone</li>
                    <li>This email contains sensitive information - please delete it after setting up your account</li>
                </ul>
            </div>
            
            <h3>📋 Your Responsibilities:</h3>
            <ul>
                <li>Review and process no due applications for the ${department} department</li>
                <li>Approve or reject applications with appropriate comments</li>
                <li>Ensure timely processing of student requests</li>
                <li>Maintain accurate records of all decisions</li>
            </ul>
            
            <h3>🚀 Getting Started:</h3>
            <ol>
                <li>Click the login button below or visit the login URL</li>
                <li>Sign in using your email and temporary password</li>
                <li>Set up a new secure password</li>
                <li>Complete your profile information</li>
                <li>Start reviewing pending applications</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Login to Your Account</a>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>If you have any questions or need assistance:</p>
            <ul>
                <li>Technical Support: <a href="mailto:support@university.edu">support@university.edu</a></li>
                <li>System Admin: <a href="mailto:admin@university.edu">admin@university.edu</a></li>
                <li>Phone: +1-234-567-8900</li>
            </ul>
            
            <div class="footer">
                <p>This email was automatically generated by the No Due System.</p>
                <p>&copy; 2024 Sample University. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  const textContent = `
Department Officer Account Setup - No Due System

Dear ${name},

Welcome to the Online No Due Form System! You have been assigned as a ${role} for the ${department} department.

LOGIN CREDENTIALS:
Email: ${email}
Temporary Password: ${temporaryPassword}
Login URL: ${loginUrl}

IMPORTANT SECURITY NOTICE:
- This is a temporary password for your first login
- You will be required to change your password after logging in
- Do not share these credentials with anyone
- Please delete this email after setting up your account

YOUR RESPONSIBILITIES:
- Review and process no due applications for the ${department} department
- Approve or reject applications with appropriate comments
- Ensure timely processing of student requests
- Maintain accurate records of all decisions

GETTING STARTED:
1. Visit the login URL: ${loginUrl}
2. Sign in using your email and temporary password
3. Set up a new secure password
4. Complete your profile information
5. Start reviewing pending applications

NEED HELP?
Technical Support: support@university.edu
System Admin: admin@university.edu
Phone: +1-234-567-8900

This email was automatically generated by the No Due System.
© 2024 Sample University. All rights reserved.
`;

  return {
    to: email,
    subject: `Department Officer Account Setup - ${department} Department`,
    htmlContent,
    textContent,
  };
};

// Simulate sending email (in production, this would call actual email service)
export const sendEmail = async (
  emailTemplate: EmailTemplate,
): Promise<boolean> => {
  try {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, this would be replaced with actual email service call
    console.log("📧 Email would be sent:", {
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      content: emailTemplate.textContent,
    });

    // Store the email in localStorage for demo purposes (so admin can see what was sent)
    const sentEmails = JSON.parse(localStorage.getItem("sentEmails") || "[]");
    sentEmails.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...emailTemplate,
    });
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails));

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

// Get sent emails (for demo purposes)
export const getSentEmails = () => {
  return JSON.parse(localStorage.getItem("sentEmails") || "[]");
};

// Create student application status notification email
export const createStudentNotificationEmail = (data: {
  studentName: string;
  studentEmail: string;
  applicationId: string;
  department: string;
  action: "approved" | "rejected";
  comments?: string;
  officerName: string;
  dashboardUrl: string;
}): EmailTemplate => {
  const {
    studentName,
    studentEmail,
    applicationId,
    department,
    action,
    comments,
    officerName,
    dashboardUrl,
  } = data;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${action === "approved" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${action === "approved" ? "#10b981" : "#ef4444"}; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 No Due System</h1>
            <h2>Application Status Update</h2>
        </div>

        <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>

            <p>We have an update regarding your no due application #${applicationId}.</p>

            <div class="status-box">
                <h3>${action === "approved" ? "✅" : "❌"} Application ${action === "approved" ? "Approved" : "Rejected"}</h3>
                <p><strong>Department:</strong> ${department}</p>
                <p><strong>Reviewed by:</strong> ${officerName}</p>
                <p><strong>Action Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${comments ? `<p><strong>${action === "approved" ? "Comments" : "Reason"}:</strong> ${comments}</p>` : ""}
            </div>

            ${
              action === "approved"
                ? `<p>🎉 <strong>Great news!</strong> Your application has been approved by the ${department} department. You're one step closer to completing your no due process.</p>`
                : `<p>Unfortunately, your application has been rejected by the ${department} department. Please review the reason provided and contact the department if you need clarification.</p>`
            }

            <h3>📋 Next Steps:</h3>
            <ul>
                <li>Check your student dashboard for detailed status</li>
                <li>Track progress across all departments</li>
                ${
                  action === "approved"
                    ? "<li>Wait for other departments to complete their review</li><li>Download your certificate once all departments approve</li>"
                    : "<li>Contact the department officer if you need clarification</li><li>Address any issues mentioned in the rejection reason</li>"
                }
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" class="button">View Application Status</a>
            </div>

            <div class="footer">
                <p>This email was automatically generated by the No Due System.</p>
                <p>&copy; 2024 Sample University. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  const textContent = `
Application Status Update - No Due System

Dear ${studentName},

We have an update regarding your no due application #${applicationId}.

STATUS: ${action.toUpperCase()}
Department: ${department}
Reviewed by: ${officerName}
Action Date: ${new Date().toLocaleDateString()}
${comments ? `${action === "approved" ? "Comments" : "Reason"}: ${comments}` : ""}

${
  action === "approved"
    ? `Great news! Your application has been approved by the ${department} department. You're one step closer to completing your no due process.`
    : `Unfortunately, your application has been rejected by the ${department} department. Please review the reason provided and contact the department if you need clarification.`
}

NEXT STEPS:
- Check your student dashboard for detailed status
- Track progress across all departments
${
  action === "approved"
    ? "- Wait for other departments to complete their review\n- Download your certificate once all departments approve"
    : "- Contact the department officer if you need clarification\n- Address any issues mentioned in the rejection reason"
}

View your application status: ${dashboardUrl}

This email was automatically generated by the No Due System.
© 2024 Sample University. All rights reserved.
`;

  return {
    to: studentEmail,
    subject: `Application ${action === "approved" ? "Approved" : "Rejected"} - ${department} Department`,
    htmlContent,
    textContent,
  };
};

// Create certificate ready notification email
export const createCertificateReadyEmail = (data: {
  studentName: string;
  studentEmail: string;
  applicationId: string;
  dashboardUrl: string;
}): EmailTemplate => {
  const { studentName, studentEmail, applicationId, dashboardUrl } = data;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Ready for Download</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .certificate-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .success-button { background: #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 No Due System</h1>
            <h2>Certificate Ready!</h2>
        </div>

        <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>

            <div class="certificate-box">
                <h2>🏆 Congratulations!</h2>
                <p style="font-size: 18px; margin: 10px 0;">Your No Due Certificate is Ready for Download</p>
                <p>Application #${applicationId}</p>
            </div>

            <p>🎉 <strong>Excellent news!</strong> All departments have approved your no due application. Your clearance process is now complete!</p>

            <h3>📋 What This Means:</h3>
            <ul>
                <li>✅ All departmental clearances obtained</li>
                <li>✅ No pending dues with any department</li>
                <li>✅ Official certificate ready for download</li>
                <li>✅ QR code verification included</li>
            </ul>

            <h3>📥 Download Your Certificate:</h3>
            <ol>
                <li>Visit your student dashboard</li>
                <li>Navigate to "My Applications"</li>
                <li>Click "Download Certificate" for your approved application</li>
                <li>Save the PDF for your records</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" class="button success-button">Download Certificate Now</a>
            </div>

            <p><strong>Important Notes:</strong></p>
            <ul>
                <li>Your certificate includes a QR code for verification</li>
                <li>Keep multiple copies for your records</li>
                <li>The certificate is valid for all official purposes</li>
                <li>Contact support if you have any issues downloading</li>
            </ul>

            <div class="footer">
                <p>Congratulations on completing your no due process!</p>
                <p>&copy; 2024 Sample University. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  const textContent = `
Certificate Ready for Download - No Due System

Dear ${studentName},

CONGRATULATIONS! Your No Due Certificate is Ready for Download
Application #${applicationId}

Excellent news! All departments have approved your no due application. Your clearance process is now complete!

WHAT THIS MEANS:
✅ All departmental clearances obtained
✅ No pending dues with any department
✅ Official certificate ready for download
✅ QR code verification included

DOWNLOAD YOUR CERTIFICATE:
1. Visit your student dashboard
2. Navigate to "My Applications"
3. Click "Download Certificate" for your approved application
4. Save the PDF for your records

Download now: ${dashboardUrl}

IMPORTANT NOTES:
- Your certificate includes a QR code for verification
- Keep multiple copies for your records
- The certificate is valid for all official purposes
- Contact support if you have any issues downloading

Congratulations on completing your no due process!
© 2024 Sample University. All rights reserved.
`;

  return {
    to: studentEmail,
    subject: "🎉 Certificate Ready for Download - No Due Process Complete!",
    htmlContent,
    textContent,
  };
};

// Send student notification email
export const sendStudentNotificationEmail = async (data: {
  studentName: string;
  studentEmail: string;
  applicationId: string;
  department: string;
  action: "approved" | "rejected";
  comments?: string;
  officerName: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const dashboardUrl = `${window.location.origin}/student/dashboard`;

    const emailTemplate = createStudentNotificationEmail({
      ...data,
      dashboardUrl,
    });

    const emailSent = await sendEmail(emailTemplate);

    if (emailSent) {
      return { success: true };
    } else {
      return { success: false, error: "Failed to send notification email" };
    }
  } catch (error) {
    return { success: false, error: "Error creating notification email" };
  }
};

// Send certificate ready email
export const sendCertificateReadyEmail = async (data: {
  studentName: string;
  studentEmail: string;
  applicationId: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const dashboardUrl = `${window.location.origin}/student/dashboard`;

    const emailTemplate = createCertificateReadyEmail({
      ...data,
      dashboardUrl,
    });

    const emailSent = await sendEmail(emailTemplate);

    if (emailSent) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Failed to send certificate ready email",
      };
    }
  } catch (error) {
    return { success: false, error: "Error creating certificate ready email" };
  }
};

// Create and send department officer setup email
export const sendDepartmentOfficerSetupEmail = async (officerData: {
  name: string;
  email: string;
  department: string;
  role: string;
}): Promise<{
  success: boolean;
  temporaryPassword?: string;
  error?: string;
}> => {
  try {
    const temporaryPassword = generateTemporaryPassword();
    const loginUrl = `${window.location.origin}/login`;

    const emailTemplate = createDepartmentOfficerSetupEmail({
      ...officerData,
      temporaryPassword,
      loginUrl,
    });

    const emailSent = await sendEmail(emailTemplate);

    if (emailSent) {
      return { success: true, temporaryPassword };
    } else {
      return { success: false, error: "Failed to send setup email" };
    }
  } catch (error) {
    return { success: false, error: "Error creating setup email" };
  }
};
