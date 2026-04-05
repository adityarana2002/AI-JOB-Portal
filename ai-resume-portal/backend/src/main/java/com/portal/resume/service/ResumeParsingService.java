package com.portal.resume.service;

import java.nio.file.Path;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class ResumeParsingService {

    private final Tika tika = new Tika();

    public String extractText(Path filePath) {
        try {
            String text = tika.parseToString(filePath);
            if (text != null) {
                log.info("Resume parsed: {} characters", text.length());
            }
            return text;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse resume", ex);
        }
    }
}
