package com.portal.export.controller;

import com.portal.export.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/api/admin/export/users")
    public ResponseEntity<byte[]> exportUsers(
        @RequestParam(defaultValue = "csv") String format,
        Authentication auth
    ) {
        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = exportService.exportUsersAsPdf(auth);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        }
        byte[] csv = exportService.exportUsersAsCsv(auth);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/api/admin/export/applications")
    public ResponseEntity<byte[]> exportApplications(Authentication auth) {
        byte[] csv = exportService.exportApplicationsAsCsv(auth);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=applications.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/api/employer/jobs/{jobId}/export/applicants")
    public ResponseEntity<byte[]> exportApplicants(
        @PathVariable Long jobId,
        @RequestParam(defaultValue = "csv") String format,
        Authentication auth
    ) {
        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = exportService.exportApplicantsForJobAsPdf(jobId, auth);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=applicants-job-" + jobId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        }
        byte[] csv = exportService.exportApplicantsForJobAsCsv(jobId, auth);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=applicants-job-" + jobId + ".csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }
}
