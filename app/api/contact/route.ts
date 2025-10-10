import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
	try {
		const { name, email, subject, message } = await request.json();

		// Validate required fields
		if (!subject || !message) {
			return NextResponse.json(
				{ error: "Subject and message are required" },
				{ status: 400 },
			);
		}

		// Email validation (only if email is provided)
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return NextResponse.json(
					{ error: "Invalid email address" },
					{ status: 400 },
				);
			}
		}

		// Check if SMTP configuration is available
		if (
			!process.env.SMTP_HOST ||
			!process.env.SMTP_USER ||
			!process.env.SMTP_PASS
		) {
			console.error("SMTP configuration missing:", {
				hasHost: !!process.env.SMTP_HOST,
				hasUser: !!process.env.SMTP_USER,
				hasPass: !!process.env.SMTP_PASS,
				hasPort: !!process.env.SMTP_PORT,
			});
			return NextResponse.json(
				{ error: "Email service is not configured. Please try again later." },
				{ status: 500 },
			);
		}

		console.log("SMTP Configuration:", {
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: process.env.SMTP_SECURE,
			user: process.env.SMTP_USER
				? `***${process.env.SMTP_USER.slice(-4)}`
				: "not set",
			from: process.env.SMTP_FROM,
			to: process.env.CONTACT_EMAIL,
		});

		// Create transporter with SMTP configuration
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT || "587", 10),
			secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
			debug: true, // Enable debug logging
			logger: true, // Enable logger
		});

		// Verify SMTP connection
		try {
			await transporter.verify();
			console.log("SMTP connection verified successfully");
		} catch (verifyError) {
			console.error("SMTP verification failed:", verifyError);
			return NextResponse.json(
				{ error: "Email service connection failed. Please try again later." },
				{ status: 500 },
			);
		}

		// Email content
		const senderName = process.env.SMTP_FROM || "Archer Health";
		const mailOptions = {
			from: `"${senderName}" <${process.env.SMTP_USER}>`,
			to: process.env.CONTACT_EMAIL || "antonioarcher.dev@gmail.com",
			subject: `Archer Health Contact${name ? ` - ${name}` : ""}: ${subject}`,
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8fbc5a;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #8fbc5a;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">
            This message was sent from the Archer Health contact form.
          </p>
        </div>
      `,
			replyTo: email || undefined,
		};

		// Send email
		console.log("Sending email:", {
			from: `"${senderName}" <${process.env.SMTP_USER}>`,
			to: process.env.CONTACT_EMAIL || "antonioarcher.dev@gmail.com",
			subject: `Archer Health Contact${name ? ` - ${name}` : ""}: ${subject}`,
		});

		const info = await transporter.sendMail(mailOptions);

		console.log("Email sent successfully:", info.messageId);

		return NextResponse.json({
			success: true,
			message: "Message sent successfully",
			messageId: info.messageId,
		});
	} catch (error) {
		console.error("Error sending email:", error);

		// Handle specific SMTP errors
		if (error instanceof Error) {
			if (error.message.includes("ECONNECTION")) {
				return NextResponse.json(
					{ error: "Failed to connect to email server" },
					{ status: 500 },
				);
			}
			if (error.message.includes("EAUTH")) {
				return NextResponse.json(
					{ error: "Email authentication failed" },
					{ status: 500 },
				);
			}
		}

		return NextResponse.json(
			{ error: "Failed to send message. Please try again later." },
			{ status: 500 },
		);
	}
}
