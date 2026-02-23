// Email Service - Sends transactional emails via Resend
import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Send welcome email to new member after Stripe payment
 */
export async function sendWelcomeEmail(
  email: string,
  inviteCode: string,
  organisationName: string
): Promise<void> {
  try {
    const resend = getResend();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${organisationName} on LifeSet</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${organisationName}! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Your membership is now active! Here's how to get started:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Step 1: Download the LifeSet App</h2>
              <p style="margin-bottom: 10px;">
                <a href="https://apps.apple.com/ie/app/lifeset/id6461768606" style="color: #667eea; text-decoration: none; font-weight: 600;">📱 iOS App Store</a> | 
                <a href="https://play.google.com/store/apps/details?id=com.lifeset.app" style="color: #667eea; text-decoration: none; font-weight: 600;">🤖 Google Play</a>
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Step 2: Create Your Account</h2>
              <p style="margin-bottom: 10px;">Use this email address: <strong>${email}</strong></p>
              <p style="margin-bottom: 0;">Create a password when prompted.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Step 3: Enter Your Invite Code</h2>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #667eea; letter-spacing: 4px; font-family: monospace;">${inviteCode}</p>
              </div>
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">The app will automatically apply this code when you sign up.</p>
            </div>
            
            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563;">
                <strong>💡 Tip:</strong> Your membership is already active, so you'll have immediate access to all features once you join!
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Questions? Contact ${organisationName} directly.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by LifeSet on behalf of ${organisationName}.
            </p>
          </div>
        </body>
      </html>
    `;

    console.log(`Attempting to send welcome email to ${email} for organisation ${organisationName} with invite code ${inviteCode}`);
    
    // Use verified domain for production emails
    // Domain: lifesetwellbeing.com (verified in Resend)
    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";
    
    console.log(`Sending email from: ${fromEmail} to: ${email}`);
    
    let result;
    try {
      result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Welcome to ${organisationName} on LifeSet! 🎉`,
        html: htmlContent,
      });
      console.log(`Resend API response received:`, JSON.stringify(result, null, 2));
    } catch (apiError: any) {
      console.error(`Resend API call failed:`, {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status,
        response: apiError.response,
        fullError: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)),
      });
      throw apiError; // Re-throw to be caught by outer catch
    }

    // Resend API returns { data: { id: string } } on success
    // Check both result.data?.id and result.id for compatibility
    const emailId = result.data?.id || (result as any).id;
    
    console.log(`Welcome email sent successfully to ${email} for organisation ${organisationName}`, {
      emailId: emailId,
      inviteCode,
      resultData: result.data,
      fullResult: JSON.stringify(result, null, 2),
    });

    // Check if email was actually sent
    if (!emailId) {
      console.warn(`Warning: Email sent but no ID returned. Response: ${JSON.stringify(result)}`);
      // This might still be successful - Resend sometimes doesn't return ID immediately
    }
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      email,
      organisationName,
      inviteCode,
      errorMessage: error.message,
      errorCode: error.code,
      errorStatus: error.statusCode,
      errorResponse: error.response,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    // Don't throw - email failure shouldn't break the webhook
    // But log extensively so we can debug
  }
}

/**
 * Send booking confirmation email when a member books a class
 */
export async function sendBookingConfirmationEmail(
  email: string,
  params: {
    className: string;
    classDate: string;
    classTime: string;
    organisationName: string;
  }
): Promise<void> {
  try {
    const resend = getResend();
    const { className, classDate, classTime, organisationName } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Class Booked - ${organisationName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're booked! ✓</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Your class has been confirmed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">${className}</h2>
              <p style="margin-bottom: 10px;"><strong>Date:</strong> ${classDate}</p>
              <p style="margin-bottom: 0;"><strong>Time:</strong> ${classTime}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Questions? Contact ${organisationName} directly.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by LifeSet on behalf of ${organisationName}.
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Class booked: ${className} - ${organisationName}`,
      html: htmlContent,
    });

    const emailId = result.data?.id || (result as any).id;
    console.log(`Booking confirmation email sent to ${email} for ${className}`, { emailId });
  } catch (error: any) {
    console.error("Error sending booking confirmation email:", {
      email,
      params,
      errorMessage: error.message,
    });
    // Don't throw - email failure shouldn't break the booking
  }
}

/**
 * Send waitlist notification when a spot opens up in a class
 */
export async function sendWaitlistSpotOpenedEmail(
  email: string,
  params: {
    className: string;
    classDate: string;
    classTime: string;
    organisationName: string;
  }
): Promise<void> {
  try {
    const resend = getResend();
    const { className, classDate, classTime, organisationName } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>A spot opened up - ${organisationName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">A spot opened up! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">You were on the waitlist for a class. A spot is now available!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #059669; font-size: 20px;">${className}</h2>
              <p style="margin-bottom: 10px;"><strong>Date:</strong> ${classDate}</p>
              <p style="margin-bottom: 0;"><strong>Time:</strong> ${classTime}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Book quickly – spots fill up fast! Open the LifeSet app or contact ${organisationName} to secure your place.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by LifeSet on behalf of ${organisationName}.
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `A spot opened up: ${className} - ${organisationName}`,
      html: htmlContent,
    });

    const emailId = result.data?.id || (result as any).id;
    console.log(`Waitlist spot-opened email sent to ${email} for ${className}`, { emailId });
  } catch (error: any) {
    console.error("Error sending waitlist spot-opened email:", {
      email,
      params,
      errorMessage: error.message,
    });
  }
}

/**
 * Send class reminder email (e.g. 24h before class)
 */
export async function sendClassReminderEmail(
  email: string,
  params: {
    className: string;
    classDate: string;
    classTime: string;
    organisationName: string;
  }
): Promise<void> {
  try {
    const resend = getResend();
    const { className, classDate, classTime, organisationName } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Class reminder - ${organisationName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Class tomorrow 📅</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Reminder: you have a class booked for tomorrow.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">${className}</h2>
              <p style="margin-bottom: 10px;"><strong>Date:</strong> ${classDate}</p>
              <p style="margin-bottom: 0;"><strong>Time:</strong> ${classTime}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              See you there! Questions? Contact ${organisationName} directly.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by LifeSet on behalf of ${organisationName}.
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Reminder: ${className} tomorrow - ${organisationName}`,
      html: htmlContent,
    });

    const emailId = result.data?.id || (result as any).id;
    console.log(`Class reminder email sent to ${email} for ${className}`, { emailId });
  } catch (error: any) {
    console.error("Error sending class reminder email:", {
      email,
      params,
      errorMessage: error.message,
    });
  }
}

/**
 * Send notification to LifeSet admin when a new gym signs up (for oversight)
 */
export async function sendNewGymSignupNotification(params: {
  gymName: string;
  gymType: string;
  adminEmail: string;
}): Promise<void> {
  try {
    const resend = getResend();
    const toEmail = process.env.LIFESET_ADMIN_EMAIL || "matthew@lifesetwellbeing.com";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New gym signup - ${params.gymName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New gym signup 🏋️</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new gym has signed up via the self-serve flow:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 8px;"><strong>Gym / Studio:</strong> ${params.gymName}</p>
              <p style="margin: 0 0 8px;"><strong>Type:</strong> ${params.gymType}</p>
              <p style="margin: 0;"><strong>Admin email:</strong> ${params.adminEmail}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              They can now complete setup in the dashboard. Consider reaching out if you discussed this offline.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              LifeSet admin notification
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New gym signup: ${params.gymName}`,
      html: htmlContent,
    });

    const emailId = result.data?.id || (result as any).id;
    console.log(`New gym signup notification sent for ${params.gymName}`, { emailId });
  } catch (error: any) {
    console.error("Error sending new gym signup notification:", {
      params,
      errorMessage: error.message,
    });
    // Don't throw - notification failure shouldn't block signup
  }
}

/**
 * Send payment failure email when a subscription renewal fails
 */
export async function sendPaymentFailureEmail(
  email: string,
  organisationName: string
): Promise<void> {
  try {
    const resend = getResend();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed - ${organisationName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Payment Failed</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We were unable to process your membership payment for <strong>${organisationName}</strong>.
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
              <h2 style="margin-top: 0; color: #b91c1c; font-size: 18px;">What you need to do</h2>
              <p style="margin-bottom: 10px;">Please update your payment method as soon as possible to avoid any interruption to your membership.</p>
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">
                You have <strong>7 days</strong> to update your payment details. After that, your membership access may be suspended.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Common reasons for payment failure:
            </p>
            <ul style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              <li>Expired card</li>
              <li>Insufficient funds</li>
              <li>Card details have changed</li>
            </ul>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Questions? Contact ${organisationName} directly.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by LifeSet on behalf of ${organisationName}.
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LifeSet <hello@lifesetwellbeing.com>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Payment Failed - Update your details for ${organisationName}`,
      html: htmlContent,
    });

    const emailId = result.data?.id || (result as any).id;
    console.log(`Payment failure email sent to ${email} for ${organisationName}`, { emailId });
  } catch (error: any) {
    console.error("Error sending payment failure email:", {
      email,
      organisationName,
      errorMessage: error.message,
    });
    // Don't throw - email failure shouldn't break the webhook
  }
}

