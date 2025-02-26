module.exports = {
    userCreationEmail: (user) => ({
      subject: "Welcome to Kinetika ALM!",
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: rgb(29, 53, 87);">Welcome to Kinetika ALM!, ${user.name}!</h2>
              <p>We're thrilled to have you join our platform. Here are your login details to get started:</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Password:</strong> ${user.password}</p>
              <p>You can log in by clicking the link below:</p>
              <p><a href="https://stagealm.kinetikalabs.com/" style="color: rgb(29, 53, 87); text-decoration: none; font-weight: bold;">Login to Kinetika ALM</a></p>
              <p>If you have any technical issues or need assistance, please feel free to reach out to our customer support team at 
                <a href="mailto:contact@kinetikalabs.com" style="color: rgb(29, 53, 87); text-decoration: none;">itsupport@kinetikalabs.com</a>.
              </p>
              <p>Welcome once again, and we hope you are excited about using our platform!</p>
              <p>Best regards,<br>
              The Kinetika Labs Team</p>
            </div>
          </body>
        </html>
      `,
    }),
  
    PasswordReset: (user) => ({
      subject: "Password Reset Request - Kinetika ALM",
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: rgb(29, 53, 87);">Password Reset Request</h2>
              <p>We received a request to reset your password for your Kinetika ALM account associated with <strong>${user.Email}</strong>.</p>
              <p>To reset your password, please click the link below:</p>
              <p>
                <a href="${user.resetUrl}" 
                   style="color: rgb(29, 53, 87); text-decoration: none; font-weight: bold; display: inline-block; padding: 10px 15px; background-color: rgb(29, 53, 87); color: #fff; border-radius: 5px;">
                  Reset Your Password
                </a>
              </p>
              <p>If you didn’t request a password reset, please ignore this email. Your account will remain secure.</p>
              <p>If you have any questions, feel free to contact our support team at 
                <a href="mailto:contact@kinetikalabs.com" style="color: rgb(29, 53, 87); text-decoration: none;">itsupport@kinetikalabs.com</a>.
              </p>
              <p>Best regards,<br>
              The Kinetika Labs Team</p>
            </div>
          </body>
        </html>
      `,
    }),
  
    passwordResetEmail: (user) => ({
      subject: "Password Reset Request",
      body: `Hi ${user.name}, click here to reset your password.`,
    }),
  };
  