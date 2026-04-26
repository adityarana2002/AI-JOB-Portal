package com.portal.notification.service;

import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import com.portal.interview.entity.Interview;
import com.portal.user.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final String APP_NAME = "AI Resume Portal";
    private static final DateTimeFormatter DT_FMT =
        DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    // ─── Send helper ──────────────────────────────────────────────────────────
    @Async
    public void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, APP_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {} | subject: {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ─── 1. Welcome Email ─────────────────────────────────────────────────────
    @Async
    public void sendWelcomeEmail(User user) {
        String role = switch (user.getRole()) {
            case EMPLOYER -> "Employer";
            case SUPER_ADMIN -> "Admin";
            default -> "Job Seeker";
        };
        String html = baseTemplate(
            "Welcome to " + APP_NAME + "! 🎉",
            """
            <h2 style="margin:0 0 8px;color:#0c1529;font-size:22px;">Hi %s,</h2>
            <p style="margin:0 0 18px;color:#5f738d;font-size:15px;line-height:1.6;">
                Welcome aboard! Your account has been created successfully as a <strong>%s</strong>.
                You can now log in and start using the platform.
            </p>
            """.formatted(user.getFullName(), role),
            List.of(
                new EmailStep("🔍", "AI Screening", "Our AI evaluates resumes instantly for best-fit candidates."),
                new EmailStep("📋", "Apply to Jobs", "Browse hundreds of open roles and apply in one click."),
                new EmailStep("📅", "Interview Scheduling", "Get notified when an employer wants to interview you.")
            ),
            "Get Started",
            "http://localhost:5173/login"
        );
        send(user.getEmail(), "Welcome to " + APP_NAME + "!", html);
    }

    // ─── 2. Application Submitted Confirmation ────────────────────────────────
    @Async
    public void sendApplicationConfirmationEmail(JobApplication application) {
        User applicant = application.getApplicant();
        String jobTitle = application.getJob().getTitle();
        String company = application.getJob().getEmployer() != null
            ? application.getJob().getEmployer().getCompanyName() != null
                ? application.getJob().getEmployer().getCompanyName()
                : application.getJob().getEmployer().getFullName()
            : "the company";

        String html = baseTemplate(
            "Application Submitted ✅",
            """
            <h2 style="margin:0 0 8px;color:#0c1529;font-size:20px;">Application Received!</h2>
            <p style="margin:0 0 6px;color:#5f738d;font-size:15px;line-height:1.6;">
                Hi <strong>%s</strong>, your application has been successfully submitted.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #0891b2;border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0;">
                <p style="margin:0 0 4px;font-size:13px;color:#5f738d;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Position</p>
                <p style="margin:0;font-size:17px;font-weight:700;color:#0c1529;">%s</p>
                <p style="margin:4px 0 0;font-size:14px;color:#5f738d;">%s</p>
            </div>
            <p style="margin:0;color:#5f738d;font-size:14px;line-height:1.6;">
                Our AI has screened your resume. The employer will review your application and reach out if you're shortlisted.
                Keep an eye on your notifications!
            </p>
            """.formatted(applicant.getFullName(), jobTitle, company),
            null,
            "View My Applications",
            "http://localhost:5173/jobseeker/applications"
        );
        send(applicant.getEmail(), "Application submitted for " + jobTitle, html);
    }

    // ─── 3. Application Status Update ─────────────────────────────────────────
    @Async
    public void sendApplicationStatusEmail(JobApplication application) {
        User applicant = application.getApplicant();
        ApplicationStatus status = application.getStatus();
        String jobTitle = application.getJob().getTitle();

        String emoji = switch (status) {
            case SHORTLISTED -> "🎉";
            case REJECTED -> "😔";
            default -> "📋";
        };
        String headingColor = switch (status) {
            case SHORTLISTED -> "#059669";
            case REJECTED -> "#dc2626";
            default -> "#0891b2";
        };
        String statusLabel = switch (status) {
            case SHORTLISTED -> "Shortlisted";
            case REJECTED -> "Not Selected";
            default -> status.name();
        };
        String bodyMsg = switch (status) {
            case SHORTLISTED ->
                "Congratulations! You have been <strong style='color:#059669;'>shortlisted</strong> for the role of <strong>" + jobTitle + "</strong>. " +
                "An interview invitation may be coming your way soon. Keep an eye on your notifications!";
            case REJECTED ->
                "Thank you for applying for <strong>" + jobTitle + "</strong>. After careful consideration, the employer has decided to move forward with other candidates. " +
                "Don't be discouraged — keep applying, your next opportunity could be just around the corner!";
            default ->
                "Your application for <strong>" + jobTitle + "</strong> status has been updated to <strong>" + statusLabel + "</strong>.";
        };

        String html = baseTemplate(
            emoji + " Application Update",
            """
            <h2 style="margin:0 0 12px;color:%s;font-size:20px;">%s %s</h2>
            <p style="margin:0;color:#5f738d;font-size:15px;line-height:1.6;">Hi <strong>%s</strong>,</p>
            <p style="margin:12px 0 0;color:#5f738d;font-size:15px;line-height:1.6;">%s</p>
            """.formatted(headingColor, emoji, statusLabel, applicant.getFullName(), bodyMsg),
            null,
            "View Application",
            "http://localhost:5173/jobseeker/applications"
        );
        send(applicant.getEmail(), emoji + " Application Update: " + jobTitle, html);
    }

    // ─── 4. Interview Scheduled ───────────────────────────────────────────────
    @Async
    public void sendInterviewScheduledEmail(Interview interview) {
        User applicant = interview.getApplicant();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String company = interview.getEmployer().getCompanyName() != null
            ? interview.getEmployer().getCompanyName()
            : interview.getEmployer().getFullName();
        String dateTime = interview.getScheduledAt().format(DT_FMT);
        String type = formatInterviewType(interview.getInterviewType().name());
        String duration = interview.getDurationMinutes() + " minutes";

        String linkRow = interview.getMeetingLink() != null && !interview.getMeetingLink().isBlank()
            ? "<tr><td style='padding:5px 0;color:#5f738d;font-size:13px;'>Meeting Link</td><td style='padding:5px 0;font-size:13px;'><a href='" + interview.getMeetingLink() + "' style='color:#0891b2;'>Join Meeting</a></td></tr>"
            : "";
        String messageBox = interview.getMessage() != null && !interview.getMessage().isBlank()
            ? "<div style='background:#f0f9ff;border-left:3px solid #0891b2;border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0;font-size:14px;color:#1e3a5f;font-style:italic;'>\"" + interview.getMessage() + "\"</div>"
            : "";

        String html = baseTemplate(
            "📅 Interview Invitation",
            """
            <h2 style="margin:0 0 6px;color:#0c1529;font-size:20px;">You've Got an Interview! 🎉</h2>
            <p style="margin:0 0 16px;color:#5f738d;font-size:15px;">Hi <strong>%s</strong>, <strong>%s</strong> has invited you for an interview.</p>
            <table style="width:100%%;border-collapse:collapse;font-size:14px;background:#f8fbff;border-radius:10px;overflow:hidden;">
                <tr style="background:#e0f2fe;"><td colspan="2" style="padding:10px 14px;font-weight:700;color:#0b2f5c;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Interview Details</td></tr>
                <tr><td style="padding:8px 14px;color:#5f738d;min-width:110px;">Position</td><td style="padding:8px 14px;font-weight:600;color:#0c1529;">%s</td></tr>
                <tr style="background:#fff;"><td style="padding:8px 14px;color:#5f738d;">Date &amp; Time</td><td style="padding:8px 14px;font-weight:600;color:#0891b2;">%s</td></tr>
                <tr><td style="padding:8px 14px;color:#5f738d;">Type</td><td style="padding:8px 14px;">%s</td></tr>
                <tr style="background:#fff;"><td style="padding:8px 14px;color:#5f738d;">Duration</td><td style="padding:8px 14px;">%s</td></tr>
                %s
            </table>
            %s
            <p style="margin:16px 0 0;color:#5f738d;font-size:13px;">Please confirm or decline your participation through the portal.</p>
            """.formatted(applicant.getFullName(), company, jobTitle, dateTime, type, duration, linkRow, messageBox),
            null,
            "View Interview",
            "http://localhost:5173/jobseeker/interviews"
        );
        send(applicant.getEmail(), "Interview Invitation – " + jobTitle + " at " + company, html);
    }

    // ─── 5. Interview Rescheduled ─────────────────────────────────────────────
    @Async
    public void sendInterviewRescheduledEmail(Interview interview) {
        User applicant = interview.getApplicant();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String company = interview.getEmployer().getCompanyName() != null
            ? interview.getEmployer().getCompanyName()
            : interview.getEmployer().getFullName();
        String newDateTime = interview.getScheduledAt().format(DT_FMT);

        String html = baseTemplate(
            "🔄 Interview Rescheduled",
            """
            <h2 style="margin:0 0 8px;color:#d97706;font-size:20px;">Interview Rescheduled</h2>
            <p style="margin:0 0 16px;color:#5f738d;font-size:15px;">Hi <strong>%s</strong>, your interview with <strong>%s</strong> has been rescheduled.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 16px;">
                <p style="margin:0 0 4px;font-size:13px;color:#92400e;text-transform:uppercase;letter-spacing:1px;font-weight:700;">New Date &amp; Time</p>
                <p style="margin:0;font-size:17px;font-weight:700;color:#0c1529;">%s</p>
            </div>
            <p style="margin:0;color:#5f738d;font-size:14px;">Please log in to confirm or decline the updated schedule.</p>
            """.formatted(applicant.getFullName(), company, newDateTime),
            null,
            "View Interview",
            "http://localhost:5173/jobseeker/interviews"
        );
        send(applicant.getEmail(), "Interview Rescheduled – " + jobTitle, html);
    }

    // ─── 6. Interview Cancelled ────────────────────────────────────────────────
    @Async
    public void sendInterviewCancelledEmail(Interview interview, boolean toApplicant) {
        User recipient = toApplicant ? interview.getApplicant() : interview.getEmployer();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String other = toApplicant
            ? (interview.getEmployer().getCompanyName() != null
                ? interview.getEmployer().getCompanyName()
                : interview.getEmployer().getFullName())
            : interview.getApplicant().getFullName();

        String html = baseTemplate(
            "❌ Interview Cancelled",
            """
            <h2 style="margin:0 0 8px;color:#dc2626;font-size:20px;">Interview Cancelled</h2>
            <p style="margin:0 0 16px;color:#5f738d;font-size:15px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0;color:#5f738d;font-size:15px;line-height:1.6;">
                The interview for <strong>%s</strong>%s has been cancelled.
            </p>
            """.formatted(
                recipient.getFullName(),
                jobTitle,
                toApplicant ? " scheduled with " + other : " with candidate " + other
            ),
            null,
            "View Portal",
            toApplicant ? "http://localhost:5173/jobseeker/interviews" : "http://localhost:5173/employer/interviews"
        );
        send(recipient.getEmail(), "Interview Cancelled – " + jobTitle, html);
    }

    // ─── 7. Candidate Response to Employer ────────────────────────────────────
    @Async
    public void sendInterviewResponseEmail(Interview interview, boolean confirmed) {
        User employer = interview.getEmployer();
        User applicant = interview.getApplicant();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String emoji = confirmed ? "✅" : "❌";
        String headingColor = confirmed ? "#059669" : "#dc2626";
        String action = confirmed ? "confirmed" : "declined";

        String html = baseTemplate(
            emoji + " Interview " + (confirmed ? "Confirmed" : "Declined"),
            """
            <h2 style="margin:0 0 8px;color:%s;font-size:20px;">%s Interview %s</h2>
            <p style="margin:0 0 16px;color:#5f738d;font-size:15px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0;color:#5f738d;font-size:15px;line-height:1.6;">
                <strong>%s</strong> has <strong style="color:%s;">%s</strong> the interview for the position of <strong>%s</strong>.
            </p>
            """.formatted(
                headingColor, emoji, confirmed ? "Confirmed" : "Declined",
                employer.getFullName(),
                applicant.getFullName(), headingColor, action, jobTitle
            ),
            null,
            "View Interviews",
            "http://localhost:5173/employer/interviews"
        );
        send(employer.getEmail(), emoji + " " + applicant.getFullName() + " " + action + " the interview – " + jobTitle, html);
    }

    // ─── HTML Template Builder ─────────────────────────────────────────────────
    private String baseTemplate(String preheader, String bodyHtml, List<EmailStep> steps, String ctaText, String ctaUrl) {
        StringBuilder stepsHtml = new StringBuilder();
        if (steps != null && !steps.isEmpty()) {
            stepsHtml.append("<table style='width:100%;border-collapse:collapse;margin:20px 0;'><tr>");
            for (EmailStep s : steps) {
                stepsHtml.append("""
                    <td style="width:33%%;text-align:center;padding:0 8px;vertical-align:top;">
                        <div style="font-size:26px;margin-bottom:8px;">%s</div>
                        <div style="font-size:13px;font-weight:700;color:#0c1529;margin-bottom:4px;">%s</div>
                        <div style="font-size:12px;color:#5f738d;line-height:1.4;">%s</div>
                    </td>
                    """.formatted(s.icon(), s.title(), s.desc()));
            }
            stepsHtml.append("</tr></table>");
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
                <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">%s</div>
                <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
                    <tr><td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">

                            <!-- Header -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#0b2f5c 0%%,#0a4f82 55%%,#0891b2 100%%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
                                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🎯 AI Resume Portal</h1>
                                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Powered by Artificial Intelligence</p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                                    %s
                                    %s
                                    <!-- CTA Button -->
                                    <div style="text-align:center;margin-top:28px;">
                                        <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#0b2f5c,#0891b2);color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px;">%s →</a>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
                                    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">This email was sent by <strong style="color:#0891b2;">AI Resume Portal</strong>.</p>
                                    <p style="margin:0;font-size:12px;color:#cbd5e1;">If you didn't expect this email, you can safely ignore it.</p>
                                </td>
                            </tr>

                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
            """.formatted(preheader, bodyHtml, stepsHtml.toString(), ctaUrl, ctaText);
    }

    // ─── 8. Application Withdrawn Email ──────────────────────────────────────
    @Async
    public void sendApplicationWithdrawnEmail(JobApplication application) {
        User applicant = application.getApplicant();
        String jobTitle = application.getJob().getTitle();
        String html = baseTemplate(
            "📤 Application Withdrawn",
            """
            <h2 style="margin:0 0 8px;color:#6b7280;font-size:20px;">Application Withdrawn</h2>
            <p style="margin:0 0 16px;color:#5f738d;font-size:15px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0;color:#5f738d;font-size:15px;line-height:1.6;">
                Your application for <strong>%s</strong> has been successfully withdrawn.
                You can apply again anytime if the position is still open.
            </p>
            """.formatted(applicant.getFullName(), jobTitle),
            null,
            "Browse Jobs",
            "http://localhost:5173/jobseeker/browse"
        );
        send(applicant.getEmail(), "Application Withdrawn – " + jobTitle, html);
    }

    // ─── 9. OTP Verification Email ────────────────────────────────────────────
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String html = baseTemplate(
            "🔐 Email Verification Code",
            """
            <h2 style="margin:0 0 8px;color:#0c1529;font-size:22px;">Verify Your Email</h2>
            <p style="margin:0 0 20px;color:#5f738d;font-size:15px;line-height:1.6;">
                Use the verification code below to complete your registration on <strong>AI Resume Portal</strong>.
            </p>
            <div style="text-align:center;margin:24px 0;">
                <div style="display:inline-block;background:linear-gradient(135deg,#0b2f5c,#0891b2);border-radius:16px;padding:20px 40px;letter-spacing:12px;font-size:32px;font-weight:800;color:#ffffff;">
                    %s
                </div>
            </div>
            <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>
            """.formatted(otp),
            null,
            "Go to Portal",
            "http://localhost:5173/auth/register"
        );
        send(toEmail, "🔐 Your verification code: " + otp, html);
    }

    private String formatInterviewType(String type) {
        return switch (type) {
            case "VIDEO_CALL" -> "📹 Video Call";
            case "PHONE_CALL" -> "📞 Phone Call";
            case "IN_PERSON" -> "🏢 In Person";
            default -> type;
        };
    }

    private record EmailStep(String icon, String title, String desc) {}
}
