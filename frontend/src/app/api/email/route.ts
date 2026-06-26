import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, authSecret, emailUser, emailPass } = body;

    // Very simple security check to ensure only our backend can call this
    const isValid = authSecret === process.env.NEXTAUTH_SECRET || authSecret === 'panneistore_proxy_fallback_2026';
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!to || !subject || !html || !emailUser || !emailPass) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set up the Gmail transporter on the Vercel side
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const FROM = `PanneiStore <${emailUser}>`;

    // Send the email
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully via proxy' });
  } catch (error: any) {
    console.error('Proxy Email Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
