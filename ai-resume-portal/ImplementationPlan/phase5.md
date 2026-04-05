# Phase 5 Report - Job Application + Resume Upload

Date: 2026-04-05
Status: Completed and verified (application APIs tested).

## Scope
- Resume upload endpoint for job applications
- Resume storage and parsing services
- Application endpoints for job seekers

## Work Completed
- Added resume storage service with configurable upload directory.
- Added resume parsing service using Apache Tika.
- Implemented application service with job seeker validation and ownership checks.
- Implemented application controller endpoints for apply and application retrieval.

## Evidence (Artifacts)
- Application controller and service: P:\College Major Project\ai-resume-portal\backend\src\main\java\com\portal\application\controller\ApplicationController.java, ApplicationService.java
- Application DTO: P:\College Major Project\ai-resume-portal\backend\src\main\java\com\portal\application\dto\ApplicationResponse.java
- Resume services: P:\College Major Project\ai-resume-portal\backend\src\main\java\com\portal\resume\service\ResumeStorageService.java, ResumeParsingService.java
- File storage config: P:\College Major Project\ai-resume-portal\backend\src\main\java\com\portal\config\FileStorageProperties.java
- Security update: P:\College Major Project\ai-resume-portal\backend\src\main\java\com\portal\config\SecurityConfig.java

## Verification (Completed)
- Applied for a job with resume upload (JOB_SEEKER JWT):
  - POST /api/applications/{jobId}/apply (multipart)
- Listed my applications (JOB_SEEKER JWT):
  - GET /api/applications/my-applications
- Retrieved application details (JOB_SEEKER JWT):
  - GET /api/applications/{id}

## Notes
- Phase 5 completion is based on code and configuration artifacts present in the repository, and verified via API checks.

## Resume Text Extract (Normalized)
The following text was extracted from the provided resume PDF and normalized to ASCII for readability.

ADITYA RANA
(+91) 8126113062 | adityarana1140@gmail.com

https://www.linkedin.com/in/aditya-rana-48657a240/
https://github.com/adityarana2002

Skills
- Core Java
- Spring, Spring Boot, Spring MVC
- Spring Security REST APIs
- Hibernate, JPA
- DataBase (MySQL)
- HTML, CSS, Thymeleaf
- GIT, GITHUB

Projects
AI Resume Builder - Spring Boot, Ollama, React, MySQL
- Built an AI-powered resume generator that creates personalized, ATS-friendly resumes.
- Integrated Ollama LLM with Spring Boot REST APIs for intelligent content generation.
- Developed a React frontend with real-time preview and PDF/Word export.
- Implemented authentication, templates, and MySQL storage for secure user data.

E-commerce Website - Spring Boot, Thymeleaf, MySQL, Spring Security
- Developed a full-stack e-commerce app with product catalog, cart, and checkout.
- Secured access using Spring Security role-based authentication (Admin/User).
- Used JPA/Hibernate with MySQL for persistence and optimized transactions.
- Designed a responsive UI with Thymeleaf + Bootstrap for better UX.

Personal Portfolio Website - HTML, CSS, JS, Spring Boot, Thymeleaf, MySQL
- Created a responsive portfolio website showcasing skills, projects, and resume.
- Built a dynamic contact form with Spring Boot + MySQL backend storage.
- Configured email notifications for instant alerts on new messages.
- Implemented Thymeleaf + Bootstrap for professional design and navigation.

Certifications
HACKERRANK JAVA (BASIC) | JAN 2024
- Validated skills in core Java concepts, Data Structures, and problem solving.

IoT Training | Samsung Innovation Campus |
- Learned IoT fundamentals, sensor networks, and data visualization.
- Hands-on experience with Arduino/Raspberry Pi

Education
Bachelor of Technology (BTech) in Computer Science
Gurukula Kangri Vishwavidyalaya, Haridwar | 2023 - 2026 (Expected Graduation)
Current GPA: 8.4 CGPA (till 6th semester)

Diploma in Computer Science
Ambedkar Institute of Technology, New Delhi | 2020 - 2023
Score: 82%
