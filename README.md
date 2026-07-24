# Expense Report Form

A web application for submitting and managing expense reports with email notifications.

## Features

- Submit expense reports with receipts
- Automatic email notifications to submitter, VPFA, and Finance Committee
- Admin dashboard for reviewing submissions
- PDF export functionality
- Secure authentication

## Email Notifications

When an expense report is submitted, the system automatically sends:

1. **Confirmation email to the submitter** - Acknowledging receipt of their expense report
2. **Notification emails to administrators**:
   - vpfa@uottawaess.ca
   - financecomm@uottawaess.ca

All emails include submission details and links to the admin dashboard for review.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables for email notifications and Google Calendar sync:
   Create a `.env` file in the root directory:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   GOOGLE_CALENDAR_ID=your-shared-calendar-id@group.calendar.google.com
   GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account-name@project-id.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_TIMEZONE=America/Toronto
   GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/your-script-id/exec
   ```

   For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an App Password: https://support.google.com/accounts/answer/185833
   - Use the App Password as SMTP_PASS

   For Google Calendar sync with service account (default path), you'll need to:
   - Create a Google Cloud service account with Calendar API enabled
   - Download the service account key JSON
   - Use `client_email` as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Use `private_key` as `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep `\\n` line breaks escaped in env vars)
   - Share your organization's target calendar with the service account email and grant at least `Make changes to events`
   - Use the calendar's ID as `GOOGLE_CALENDAR_ID`

   Free alternative (no Google Cloud service account key in this app):
   - Set `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` to a deployed Google Apps Script web app endpoint
   - Keep `GOOGLE_CALENDAR_TIMEZONE` (and optionally `GOOGLE_CALENDAR_ID` if your script uses it)
   - When webhook URL is set, the API will send event details to Apps Script instead of using service-account auth

3. Start the local full-stack server:
   ```bash
   npm start
   ```

   If you only want the Vite frontend dev server, use:
   ```bash
   npm run dev
   ```

4. For production deployment, set the environment variables in your hosting platform (Vercel, etc.)

## Admin Access

- Default admin password hash is set in `server.js`
- To change the password, update the `ADMIN_PASSWORD_HASH` variable with a SHA-256 hash of your desired password

## Email Notifications

When an expense report is submitted, automatic email notifications are sent to:
- **Submitter**: Confirmation that their expense report was received
- **vpfa@uottawaess.ca**: Notification of new submission requiring review
- **financecomm@uottawaess.ca**: Notification of new submission requiring review

## API Endpoints

- `POST /submit` - Submit expense report (triggers email notifications)
- `GET /admin` - Admin dashboard (requires authentication)
- `GET /api/pdf?id=:id` - Export submission as PDF