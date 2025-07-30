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
  temporaryPassword: string;
  loginUrl: string;
}

// Generate a temporary password
export const generateTemporaryPassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
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
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Create department officer setup email template
export const createDepartmentOfficerSetupEmail = (data: DepartmentOfficerSetupData): EmailTemplate => {
  const { name, email, department, role, temporaryPassword, loginUrl } = data;
  
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
    textContent
  };
};

// Simulate sending email (in production, this would call actual email service)
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
  try {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be replaced with actual email service call
    console.log('📧 Email would be sent:', {
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      content: emailTemplate.textContent
    });
    
    // Store the email in localStorage for demo purposes (so admin can see what was sent)
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    sentEmails.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...emailTemplate
    });
    localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Get sent emails (for demo purposes)
export const getSentEmails = () => {
  return JSON.parse(localStorage.getItem('sentEmails') || '[]');
};

// Create and send department officer setup email
export const sendDepartmentOfficerSetupEmail = async (officerData: {
  name: string;
  email: string;
  department: string;
  role: string;
}): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> => {
  try {
    const temporaryPassword = generateTemporaryPassword();
    const loginUrl = `${window.location.origin}/login`;
    
    const emailTemplate = createDepartmentOfficerSetupEmail({
      ...officerData,
      temporaryPassword,
      loginUrl
    });
    
    const emailSent = await sendEmail(emailTemplate);
    
    if (emailSent) {
      return { success: true, temporaryPassword };
    } else {
      return { success: false, error: 'Failed to send setup email' };
    }
  } catch (error) {
    return { success: false, error: 'Error creating setup email' };
  }
};
