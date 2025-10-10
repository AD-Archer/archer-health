# Archer Health

## Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

### SMTP Configuration

The contact form on the privacy page requires SMTP configuration to send emails. Configure the following environment variables:

```env
# SMTP Configuration for Contact Form
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@archerhealth.com"

# Contact Email (where contact form messages are sent)
CONTACT_EMAIL="antonioarcher.dev@gmail.com"
```

#### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use your Gmail address as `SMTP_USER`
4. Use the App Password as `SMTP_PASS`
5. **Important**: Make sure "Less secure app access" is disabled (2FA + App Password is the secure way)

#### Troubleshooting Email Issues
If emails aren't being received:
1. Check your spam/junk folder
2. Verify the App Password is correct and hasn't expired
3. Try regenerating the App Password
4. Check Gmail security settings for blocked sign-ins
5. Test with the `/api/test-smtp` endpoint to verify connection

#### Testing SMTP Configuration
You can test your SMTP setup by visiting `http://localhost:3000/api/test-smtp` in your browser. This will verify the connection without sending an actual email.

#### Other Email Providers
The SMTP configuration works with most email providers. Common settings:

- **Gmail**: `smtp.gmail.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## Error Handling

The application includes comprehensive error handling:

### Global Error Page (`app/error.tsx`)
- Catches unexpected application errors
- Automatically sends email notifications to admin in production
- Shows detailed error information in development mode
- Provides user-friendly error recovery options

### 404 Not Found Page (`app/not-found.tsx`)
- Custom 404 page with professional design
- Includes error reporting form for users to report broken links
- Sends detailed reports to admin email with context information

Both error pages use the same SMTP configuration as the contact form for sending notifications.

