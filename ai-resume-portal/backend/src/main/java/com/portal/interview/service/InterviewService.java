package com.portal.interview.service;

import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import com.portal.application.repository.ApplicationRepository;
import com.portal.interview.dto.CandidateResponseRequest;
import com.portal.interview.dto.InterviewResponse;
import com.portal.interview.dto.RescheduleInterviewRequest;
import com.portal.interview.dto.ScheduleInterviewRequest;
import com.portal.interview.entity.Interview;
import com.portal.interview.entity.InterviewStatus;
import com.portal.interview.repository.InterviewRepository;
import com.portal.notification.entity.NotificationType;
import com.portal.notification.service.EmailService;
import com.portal.notification.service.NotificationService;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public InterviewResponse scheduleInterview(ScheduleInterviewRequest request, Authentication auth) {
        User employer = resolveUser(auth);
        requireRole(employer, Role.EMPLOYER);

        JobApplication application = applicationRepository.findById(request.applicationId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your job posting");
        }

        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only shortlisted candidates can be invited for interview");
        }

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setEmployer(employer);
        interview.setApplicant(application.getApplicant());
        interview.setScheduledAt(request.scheduledAt());
        interview.setMeetingLink(request.meetingLink());
        interview.setInterviewType(request.interviewType());
        interview.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60);
        interview.setMessage(request.message());
        interview.setStatus(InterviewStatus.SCHEDULED);

        Interview saved = interviewRepository.save(interview);

        String companyName = employer.getCompanyName() != null ? employer.getCompanyName() : employer.getFullName();
        notificationService.send(
            application.getApplicant(),
            NotificationType.INTERVIEW_SCHEDULED,
            "Interview Scheduled",
            "You have been invited for an interview at " + companyName
                + " for the role of " + application.getJob().getTitle()
                + ". Scheduled on " + request.scheduledAt().toLocalDate() + ".",
            saved.getId(), "INTERVIEW"
        );
        emailService.sendInterviewScheduledEmail(saved);

        return InterviewResponse.from(saved);
    }

    @Transactional
    public InterviewResponse rescheduleInterview(Long id, RescheduleInterviewRequest request, Authentication auth) {
        User employer = resolveUser(auth);
        Interview interview = getInterviewOrThrow(id);

        if (!interview.getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your interview");
        }

        if (interview.getStatus() == InterviewStatus.COMPLETED
            || interview.getStatus() == InterviewStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reschedule a completed or cancelled interview");
        }

        if (request.scheduledAt() != null) interview.setScheduledAt(request.scheduledAt());
        if (request.meetingLink() != null) interview.setMeetingLink(request.meetingLink());
        if (request.interviewType() != null) interview.setInterviewType(request.interviewType());
        if (request.durationMinutes() != null) interview.setDurationMinutes(request.durationMinutes());
        if (request.message() != null) interview.setMessage(request.message());
        interview.setStatus(InterviewStatus.RESCHEDULED);

        Interview saved = interviewRepository.save(interview);

        notificationService.send(
            interview.getApplicant(),
            NotificationType.INTERVIEW_RESCHEDULED,
            "Interview Rescheduled",
            "Your interview for " + interview.getApplication().getJob().getTitle()
                + " has been rescheduled to " + saved.getScheduledAt().toLocalDate() + ".",
            saved.getId(), "INTERVIEW"
        );
        emailService.sendInterviewRescheduledEmail(saved);

        return InterviewResponse.from(saved);
    }

    @Transactional
    public InterviewResponse cancelInterview(Long id, Authentication auth) {
        User user = resolveUser(auth);
        Interview interview = getInterviewOrThrow(id);

        boolean isEmployer = interview.getEmployer().getId().equals(user.getId());
        boolean isApplicant = interview.getApplicant().getId().equals(user.getId());

        if (!isEmployer && !isApplicant && user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        interview.setStatus(InterviewStatus.CANCELLED);
        Interview saved = interviewRepository.save(interview);

        User recipient = isEmployer ? interview.getApplicant() : interview.getEmployer();
        notificationService.send(
            recipient,
            NotificationType.INTERVIEW_CANCELLED,
            "Interview Cancelled",
            "The interview for " + interview.getApplication().getJob().getTitle() + " has been cancelled.",
            saved.getId(), "INTERVIEW"
        );
        emailService.sendInterviewCancelledEmail(saved, isEmployer);

        return InterviewResponse.from(saved);
    }

    @Transactional
    public InterviewResponse respondToInterview(Long id, CandidateResponseRequest request, Authentication auth) {
        User applicant = resolveUser(auth);
        Interview interview = getInterviewOrThrow(id);

        if (!interview.getApplicant().getId().equals(applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your interview");
        }

        if (interview.getStatus() != InterviewStatus.SCHEDULED
            && interview.getStatus() != InterviewStatus.RESCHEDULED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Interview is not awaiting response");
        }

        interview.setStatus(request.confirm() ? InterviewStatus.CONFIRMED : InterviewStatus.DECLINED);
        if (request.candidateNote() != null) {
            interview.setCandidateNote(request.candidateNote());
        }

        Interview saved = interviewRepository.save(interview);

        NotificationType type = request.confirm()
            ? NotificationType.INTERVIEW_CONFIRMED
            : NotificationType.INTERVIEW_DECLINED;

        String msg = request.confirm()
            ? applicant.getFullName() + " has confirmed the interview for " + interview.getApplication().getJob().getTitle() + "."
            : applicant.getFullName() + " has declined the interview for " + interview.getApplication().getJob().getTitle() + ".";

        notificationService.send(interview.getEmployer(), type, "Interview " + (request.confirm() ? "Confirmed" : "Declined"), msg, saved.getId(), "INTERVIEW");
        emailService.sendInterviewResponseEmail(saved, request.confirm());

        return InterviewResponse.from(saved);
    }

    @Transactional
    public InterviewResponse markCompleted(Long id, Authentication auth) {
        User employer = resolveUser(auth);
        Interview interview = getInterviewOrThrow(id);

        if (!interview.getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your interview");
        }

        interview.setStatus(InterviewStatus.COMPLETED);
        return InterviewResponse.from(interviewRepository.save(interview));
    }

    public List<InterviewResponse> getMyInterviews(Authentication auth) {
        User user = resolveUser(auth);
        if (user.getRole() == Role.EMPLOYER) {
            return interviewRepository.findByEmployerId(user.getId())
                .stream().map(InterviewResponse::from).toList();
        }
        return interviewRepository.findByApplicantId(user.getId())
            .stream().map(InterviewResponse::from).toList();
    }

    public List<InterviewResponse> getInterviewsForApplication(Long applicationId, Authentication auth) {
        User user = resolveUser(auth);
        JobApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        boolean canAccess = application.getApplicant().getId().equals(user.getId())
            || application.getJob().getEmployer().getId().equals(user.getId())
            || user.getRole() == Role.SUPER_ADMIN;

        if (!canAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return interviewRepository.findByApplicationId(applicationId)
            .stream().map(InterviewResponse::from).toList();
    }

    public InterviewResponse getInterview(Long id, Authentication auth) {
        User user = resolveUser(auth);
        Interview interview = getInterviewOrThrow(id);

        boolean canView = interview.getApplicant().getId().equals(user.getId())
            || interview.getEmployer().getId().equals(user.getId())
            || user.getRole() == Role.SUPER_ADMIN;

        if (!canView) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return InterviewResponse.from(interview);
    }

    private Interview getInterviewOrThrow(Long id) {
        return interviewRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private void requireRole(User user, Role role) {
        if (user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                role.name() + " access required");
        }
    }
}
