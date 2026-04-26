package com.portal.export.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.portal.application.entity.JobApplication;
import com.portal.application.repository.ApplicationRepository;
import com.portal.job.repository.JobRepository;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ── CSV: All Users (Admin) ──────────────────────────────────────────────
    public byte[] exportUsersAsCsv(Authentication auth) {
        requireSuperAdmin(auth);
        List<User> users = userRepository.findAll();
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT
            .withHeader("ID", "Full Name", "Email", "Role", "Phone", "Company", "Active", "Created At"))) {
            for (User u : users) {
                printer.printRecord(u.getId(), u.getFullName(), u.getEmail(),
                    u.getRole(), u.getPhone(), u.getCompanyName(),
                    u.getIsActive(), u.getCreatedAt() != null ? u.getCreatedAt().format(DT_FMT) : "");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export CSV", e);
        }
        return sw.toString().getBytes();
    }

    // ── CSV: All Applications (Admin) ───────────────────────────────────────
    public byte[] exportApplicationsAsCsv(Authentication auth) {
        requireSuperAdmin(auth);
        List<JobApplication> apps = applicationRepository.findAll();
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT
            .withHeader("ID", "Job Title", "Applicant Name", "Applicant Email", "Status", "Applied On"))) {
            for (JobApplication a : apps) {
                printer.printRecord(a.getId(),
                    a.getJob() != null ? a.getJob().getTitle() : "",
                    a.getApplicant() != null ? a.getApplicant().getFullName() : "",
                    a.getApplicant() != null ? a.getApplicant().getEmail() : "",
                    a.getStatus(),
                    a.getCreatedAt() != null ? a.getCreatedAt().format(DT_FMT) : "");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export CSV", e);
        }
        return sw.toString().getBytes();
    }

    // ── CSV: Applicants for a Job (Employer) ────────────────────────────────
    public byte[] exportApplicantsForJobAsCsv(Long jobId, Authentication auth) {
        User employer = resolveUser(auth);
        validateJobOwnership(jobId, employer);
        List<JobApplication> apps = applicationRepository.findByJobId(jobId);
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT
            .withHeader("Rank", "Applicant Name", "Email", "Status", "Applied On"))) {
            int rank = 1;
            for (JobApplication a : apps) {
                printer.printRecord(rank++,
                    a.getApplicant() != null ? a.getApplicant().getFullName() : "",
                    a.getApplicant() != null ? a.getApplicant().getEmail() : "",
                    a.getStatus(),
                    a.getCreatedAt() != null ? a.getCreatedAt().format(DT_FMT) : "");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export CSV", e);
        }
        return sw.toString().getBytes();
    }

    // ── PDF: Applicants for a Job ───────────────────────────────────────────
    public byte[] exportApplicantsForJobAsPdf(Long jobId, Authentication auth) {
        User employer = resolveUser(auth);
        validateJobOwnership(jobId, employer);
        List<JobApplication> apps = applicationRepository.findByJobId(jobId);

        String jobTitle = jobRepository.findById(jobId)
            .map(j -> j.getTitle()).orElse("Job #" + jobId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(11, 47, 92));
            Paragraph title = new Paragraph("Applicants Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new Color(100, 116, 139));
            Paragraph sub = new Paragraph(jobTitle + " — " + apps.size() + " applicant(s)", subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(20);
            document.add(sub);

            // Table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 3, 3.5f, 2, 2.5f});

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Color headerBg = new Color(11, 47, 92);
            String[] headers = {"#", "Name", "Email", "Status", "Applied On"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(30, 41, 59));
            int rank = 1;
            for (JobApplication a : apps) {
                Color rowBg = rank % 2 == 0 ? new Color(248, 250, 252) : Color.WHITE;
                addCell(table, String.valueOf(rank++), dataFont, rowBg);
                addCell(table, a.getApplicant() != null ? a.getApplicant().getFullName() : "", dataFont, rowBg);
                addCell(table, a.getApplicant() != null ? a.getApplicant().getEmail() : "", dataFont, rowBg);
                addCell(table, a.getStatus() != null ? a.getStatus().name() : "", dataFont, rowBg);
                addCell(table, a.getCreatedAt() != null ? a.getCreatedAt().format(DT_FMT) : "", dataFont, rowBg);
            }

            document.add(table);

            // Footer
            Paragraph footer = new Paragraph("Generated by AI Resume Portal", 
                FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(148, 163, 184)));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF", e);
        } finally {
            document.close();
        }
        return baos.toByteArray();
    }

    // ── PDF: All Users (Admin) ──────────────────────────────────────────────
    public byte[] exportUsersAsPdf(Authentication auth) {
        requireSuperAdmin(auth);
        List<User> users = userRepository.findAll();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(11, 47, 92));
            Paragraph title = new Paragraph("Users Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new Color(100, 116, 139));
            Paragraph sub = new Paragraph(users.size() + " registered user(s)", subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(20);
            document.add(sub);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.5f, 2.5f, 3f, 1.5f, 1.2f, 2f});

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Color headerBg = new Color(11, 47, 92);
            String[] headers = {"#", "Name", "Email", "Role", "Active", "Created"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(30, 41, 59));
            int idx = 1;
            for (User u : users) {
                Color rowBg = idx % 2 == 0 ? new Color(248, 250, 252) : Color.WHITE;
                addCell(table, String.valueOf(idx++), dataFont, rowBg);
                addCell(table, u.getFullName(), dataFont, rowBg);
                addCell(table, u.getEmail(), dataFont, rowBg);
                addCell(table, u.getRole().name(), dataFont, rowBg);
                addCell(table, u.getIsActive() ? "Yes" : "No", dataFont, rowBg);
                addCell(table, u.getCreatedAt() != null ? u.getCreatedAt().format(DT_FMT) : "", dataFont, rowBg);
            }

            document.add(table);

            Paragraph footer = new Paragraph("Generated by AI Resume Portal",
                FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(148, 163, 184)));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF", e);
        } finally {
            document.close();
        }
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }

    private void validateJobOwnership(Long jobId, User user) {
        if (user.getRole() == Role.SUPER_ADMIN) return;
        if (user.getRole() != Role.EMPLOYER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        jobRepository.findById(jobId).ifPresentOrElse(job -> {
            if (job.getEmployer() == null || !job.getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        }, () -> {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        });
    }

    private void requireSuperAdmin(Authentication auth) {
        User user = resolveUser(auth);
        if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        }
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
