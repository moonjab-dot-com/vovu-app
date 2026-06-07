import { Resend } from 'resend'

const resend  = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function sendMagicLink(
  email: string,
  token: string,
  campusName: string,
) {
  const link = `${APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

  return resend.emails.send({
    from: 'Vovu <hello@vovu.co>',
    to: email,
    subject: 'Your Vovu link 🥨',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#FFEFB3;font-family:system-ui,sans-serif;
        max-width:480px;margin:0 auto;padding:40px 24px">
        <div style="margin-bottom:32px">
          <span style="font-family:Georgia,serif;font-size:28px;
            font-weight:700;color:#013E37">Vovu</span>
          <span style="font-size:20px;margin-left:8px">🥨</span>
        </div>
        <p style="font-size:16px;color:#013E37;line-height:1.6">
          Your link for ${campusName}.
        </p>
        <a href="${link}"
          style="display:inline-block;background:#013E37;color:#FFEFB3;
          padding:14px 28px;border-radius:10px;text-decoration:none;
          font-size:15px;font-weight:500;margin:24px 0">
          Open Vovu →
        </a>
        <p style="font-size:13px;color:#6B8B87;margin-top:32px">
          Expires in 15 minutes.
          If you didn't request this, ignore it.
        </p>
        <p style="font-size:11px;color:#6B8B87;margin-top:40px">
          Last names never shared. Ever.
        </p>
      </body>
      </html>
    `,
  })
}

export async function sendMatchReveal(params: {
  to: string
  firstName: string
  matchFirstName: string
  matchEmail: string
  activity: string
  exactLocation: string
  exactTime: string
}) {
  return resend.emails.send({
    from: 'Vovu <hello@vovu.co>',
    to: params.to,
    subject: `It's a match — ${params.activity} with ${params.matchFirstName} 🥨`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#FFEFB3;font-family:system-ui,sans-serif;
        max-width:480px;margin:0 auto;padding:40px 24px">
        <div style="margin-bottom:24px">
          <span style="font-family:Georgia,serif;font-size:28px;
            font-weight:700;color:#013E37">Vovu</span>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:36px;
          color:#013E37;margin-bottom:8px">
          It's a match.
        </h1>
        <p style="font-size:16px;color:#013E37">
          Hey ${params.firstName} — you're going with
          <strong>${params.matchFirstName}</strong>.
        </p>
        <div style="background:white;border-radius:16px;
          padding:24px;margin:32px 0">
          <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;
            text-transform:uppercase;color:#6B8B87;margin-bottom:16px">
            YOUR PLAN
          </p>
          <p style="font-size:15px;color:#013E37;margin:0 0 10px">
            📍 ${params.exactLocation}
          </p>
          <p style="font-size:15px;color:#013E37;margin:0 0 10px">
            🕐 ${params.exactTime}
          </p>
          <p style="font-size:15px;color:#013E37;margin:0">
            ✉️ ${params.matchEmail}
          </p>
        </div>
        <p style="font-size:12px;color:#6B8B87;line-height:1.6">
          Last name never shared by Vovu.
          You received only their first name and campus email.
        </p>
      </body>
      </html>
    `,
  })
}
