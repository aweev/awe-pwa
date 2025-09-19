// lib/auth/verification/verification.templates.ts (Enhanced)
interface EmailTemplateData {
  name?: string;
  verifyUrl?: string;
  resetUrl?: string;
  organizationName?: string;
  supportEmail?: string;
}

const defaultData = {
  organizationName: 'AWE e.V.',
  supportEmail: 'support@awe-ev.org',
};

export function verificationEmailTemplate(data: EmailTemplateData) {
  const { name, verifyUrl, organizationName, supportEmail } = { ...defaultData, ...data };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ${organizationName}</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #F9F8F6; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #D95D39 0%, #F0A202 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 20px; }
        .greeting { font-size: 18px; color: #1D2129; margin-bottom: 20px; }
        .message { font-size: 16px; color: #65676B; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: #D95D39; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { background: #C54D29; }
        .footer { background: #F9F8F6; padding: 30px 20px; text-align: center; font-size: 14px; color: #65676B; }
        .security-note { background: #FFF7ED; border: 1px solid #FED7AA; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .security-note strong { color: #EA580C; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🤝 ${organizationName}</div>
          <div class="header-subtitle">Empowering Communities Through Dignified Growth</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${name ? name : 'there'},</div>
          
          <div class="message">
            Welcome to ${organizationName}! We're excited to have you join our community dedicated to creating positive change through empowerment and sustainable development.
          </div>
          
          <div class="message">
            To complete your registration and start your journey with us, please verify your email address by clicking the button below:
          </div>
          
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify My Email</a>
          </div>
          
          <div class="security-note">
            <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with ${organizationName}, you can safely ignore this email.
          </div>
          
          <div class="message">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${verifyUrl}" style="color: #D95D39; word-break: break-all;">${verifyUrl}</a>
          </div>
          
          <div class="message">
            Once verified, you'll have access to our community platform where you can connect with other members, access resources, and stay updated on our programs and impact.
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The ${organizationName} Team</p>
          <p>Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #D95D39;">${supportEmail}</a></p>
          <p style="font-size: 12px; color: #9CA3AF; margin-top: 20px;">
            This email was sent to verify your account registration. If you didn't sign up for ${organizationName}, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${name ? name : 'there'},

    Welcome to ${organizationName}! 

    To complete your registration, please verify your email address by visiting: ${verifyUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with ${organizationName}, you can safely ignore this email.

    Best regards,
    The ${organizationName} Team

    Questions? Contact us at ${supportEmail}
  `;

  return { 
    html, 
    text, 
    subject: `Welcome to ${organizationName} - Please verify your email` 
  };
}

export function passwordResetTemplate(data: EmailTemplateData) {
  const { name, resetUrl, organizationName, supportEmail } = { ...defaultData, ...data };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ${organizationName}</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #F9F8F6; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #D95D39 0%, #F0A202 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 20px; }
        .greeting { font-size: 18px; color: #1D2129; margin-bottom: 20px; }
        .message { font-size: 16px; color: #65676B; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: #D95D39; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .footer { background: #F9F8F6; padding: 30px 20px; text-align: center; font-size: 14px; color: #65676B; }
        .security-note { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .security-note strong { color: #DC2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔐 Password Reset</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${name ? name : 'there'},</div>
          
          <div class="message">
            We received a request to reset the password for your ${organizationName} account.
          </div>
          
          <div class="message">
            Click the button below to create a new password:
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="security-note">
            <strong>Security Note:</strong> This reset link will expire in 2 hours for your security. If you didn't request a password reset, please ignore this email - your account is still secure.
          </div>
          
          <div class="message">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #D95D39; word-break: break-all;">${resetUrl}</a>
          </div>
          
          <div class="message">
            For your security, we recommend choosing a strong password that you haven't used elsewhere.
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The ${organizationName} Team</p>
          <p>Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #D95D39;">${supportEmail}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${name ? name : 'there'},

    We received a request to reset the password for your ${organizationName} account.

    To reset your password, please visit: ${resetUrl}

    This reset link will expire in 2 hours for your security.

    If you didn't request a password reset, please ignore this email - your account is still secure.

    Best regards,
    The ${organizationName} Team

    Questions? Contact us at ${supportEmail}
  `;

  return { 
    html, 
    text, 
    subject: `Reset your ${organizationName} password` 
  };
}

export function welcomeEmailTemplate(data: EmailTemplateData & { dashboardUrl?: string }) {
  const { name, organizationName, supportEmail, dashboardUrl } = { ...defaultData, ...data };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${organizationName}!</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #F9F8F6; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #D95D39 0%, #F0A202 100%); padding: 40px 20px; text-align: center; color: white; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 20px; }
        .greeting { font-size: 20px; color: #1D2129; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #65676B; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: #D95D39; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .feature-list { background: #FFF7ED; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin-bottom: 10px; }
        .footer { background: #F9F8F6; padding: 30px 20px; text-align: center; font-size: 14px; color: #65676B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎉 Welcome to ${organizationName}!</div>
          <div>Your journey towards dignified growth begins now</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${name}!</div>
          
          <div class="message">
            Welcome to the ${organizationName} community! We're thrilled to have you join our mission of empowering communities through sustainable development and meaningful change.
          </div>
          
          <div class="feature-list">
            <h3 style="color: #D95D39; margin-top: 0;">What you can do now:</h3>
            <div class="feature-item">✨ Complete your profile to connect with like-minded members</div>
            <div class="feature-item">📚 Access exclusive resources and training materials</div>
            <div class="feature-item">🤝 Discover volunteer and mentorship opportunities</div>
            <div class="feature-item">📊 Track your impact and contribution to our mission</div>
            <div class="feature-item">🌍 Stay updated on our programs and community initiatives</div>
          </div>
          
          ${dashboardUrl ? `
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Explore Your Dashboard</a>
            </div>
          ` : ''}
          
          <div class="message">
            Our community is built on the belief that real change happens when communities lead their own transformation. Together, we'll create lasting impact through dignified growth and radiant community connections.
          </div>
          
          <div class="message">
            If you have any questions or need assistance getting started, don't hesitate to reach out to our support team.
          </div>
        </div>
        
        <div class="footer">
          <p>With gratitude,<br>The ${organizationName} Team</p>
          <p>Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #D95D39;">${supportEmail}</a></p>
          <p style="font-size: 12px; color: #9CA3AF; margin-top: 20px;">
            You're receiving this email because you created an account with ${organizationName}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${name}!

    Welcome to the ${organizationName} community! We're thrilled to have you join our mission.

    What you can do now:
    • Complete your profile to connect with like-minded members
    • Access exclusive resources and training materials
    • Discover volunteer and mentorship opportunities
    • Track your impact and contribution to our mission
    • Stay updated on our programs and community initiatives

    ${dashboardUrl ? `Explore your dashboard: ${dashboardUrl}` : ''}

    Our community is built on the belief that real change happens when communities lead their own transformation.

    If you have any questions, contact us at ${supportEmail}

    With gratitude,
    The ${organizationName} Team
  `;

  return { 
    html, 
    text, 
    subject: `Welcome to ${organizationName}, ${name}! 🎉` 
  };
}