package org.gaucho.courses.controller;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.microsoft.applicationinsights.TelemetryClient;
import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.DTO.ScheduleControllerRequest;
import org.gaucho.courses.DTO.ScheduleControllerResponse;
import org.gaucho.courses.DTO.ScheduleControllerSaveRequest;
import org.gaucho.courses.auth.UserController;
import org.gaucho.courses.controller.service.LazyCartesianProductScheduler;
import org.gaucho.courses.domain.core.Event;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.scheduling.Schedule;
import org.gaucho.courses.domain.scheduling.ScheduleSortingAttributes;
import org.gaucho.courses.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import com.google.common.collect.Sets;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.PatchMapping;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("api/schedules/")
public class ScheduleController {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserController userController;

    private TelemetryClient telemetryClient = new TelemetryClient();

    @PostMapping(value = "/generate", consumes = "application/json")
    public ResponseEntity<?> generateSchedules(@RequestBody ScheduleControllerRequest scheduleControllerRequest) {

        telemetryClient.trackMetric("num_classSections_requested", scheduleControllerRequest.getClassSections().size());

        if (scheduleControllerRequest.getClassSections().size() == 0) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("No classSections were provided in the request body.");
        }

        // Get lectures grouped by course
        List<Set<ClassSection>> lectures = scheduleControllerRequest
            .getClassSections()
            .stream()
            .filter((ClassSection::isLecture))
            .distinct()
            .collect(Collectors.groupingBy(ClassSection::getCourseId))
            .values()  //.collect() returns a Map, this gets the values
            .stream()
            .map(HashSet::new)
            .collect(Collectors.toList());

        // Create all combinations of lectures
        Set<List<ClassSection>> product = Sets.cartesianProduct(lectures);

        // Filter out conflicting combinations of lectures
        List<List<ClassSection>> nonConflictingCombinations = product
            .stream()
            .filter(list -> !Event.eventsHaveConflicts(list))
            .collect(Collectors.toList());

        // Validation
        if (nonConflictingCombinations.size() == 0) {
            return ResponseEntity
                .status(HttpStatus.NOT_ACCEPTABLE)
                .body("All combinations of the lectures conflict. No schedules can be made");
        } else if (lectures.size() == 0) {
            return ResponseEntity
                .status(HttpStatus.NOT_ACCEPTABLE)
                .body("No lectures found in the request.");
        }

        // Generate schedules and send response...

        LazyCartesianProductScheduler scheduler = new LazyCartesianProductScheduler(
            scheduleControllerRequest.getClassSections(),
            scheduleControllerRequest.getCustomEvents()
        );

        List<Schedule> schedules = scheduler.getSchedules(
            scheduleControllerRequest.getLastScheduleIndex(),
            scheduleControllerRequest.getPageSize()
        );

        log.debug("Number of schedules = "+schedules.size());
        log.debug("Preparing scheduler response...");

        ScheduleControllerResponse response = new ScheduleControllerResponse();
        response.setSchedules(schedules);
        response.setLastScheduleIndex(scheduler.getLastIndex());
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    /**
     * A protected REST endpoint to save schedules. If the user is not authenticated, the POST request fails. If the schedule
     * has already been saved, then this method updates the saved record.
     * @param schedule A schedule to save.
     * @return A response entity with no body.
     */
    @PostMapping(value = "/")
    @Secured("ROLE_USER")
    public ResponseEntity<?> saveSchedule(@RequestBody ScheduleControllerSaveRequest scheduleControllerSaveRequest) {

        String authenticatedUsersEmail = userController.getUserEmail();
        boolean isCustom = scheduleControllerSaveRequest.getSelectedClassSections() != null;

        // If this schedule is a custom schedule, we need to build it as a scheduleBuilder object to calculate
        // sortable attributes and not create duplicate code in frontend ScheduleC.Vue
        if (isCustom) {
            Schedule customSchedule = new Schedule.ScheduleBuilder(scheduleControllerSaveRequest.getSchedule().getQuarter(), authenticatedUsersEmail)
                    .setScheduledClasses(scheduleControllerSaveRequest.getScheduledClassSections())
                    .setSelectedClasses(scheduleControllerSaveRequest.getSelectedClassSections())
                    .setCustomEvents(scheduleControllerSaveRequest.getCustomEvents())
                    .build();

            String quarter = scheduleControllerSaveRequest.getSchedule().getQuarter();
            String userEmail = scheduleControllerSaveRequest.getSchedule().getUserEmail();
            String scheduleName = scheduleControllerSaveRequest.getSchedule().getName();
            int totalUnits = scheduleControllerSaveRequest.getSchedule().getTotalUnits();

            scheduleControllerSaveRequest.setSchedule(customSchedule);

            scheduleControllerSaveRequest.getSchedule().setQuarter(quarter);
            scheduleControllerSaveRequest.getSchedule().setUserEmail(userEmail);
            scheduleControllerSaveRequest.getSchedule().setName(scheduleName);
            scheduleControllerSaveRequest.getSchedule().setTotalUnits(totalUnits);
        }

        List<Schedule> userSchedules = scheduleRepository.findByUserEmail(authenticatedUsersEmail);

        // Record exists, persist
        // In order to use IDs to check if a schedule already exists.
        for (Schedule userSchedule : userSchedules) {
            if (userSchedule.getClasses().equals(scheduleControllerSaveRequest.getSchedule().getClasses()) && userSchedule.getQuarter().equals(scheduleControllerSaveRequest.getSchedule().getQuarter()) && userSchedule.getCustomEvents().equals(scheduleControllerSaveRequest.getSchedule().getCustomEvents())) {
                if (isCustom) {
                    return ResponseEntity
                            .status(HttpStatus.ACCEPTED)
                            .body(userSchedule);
                }
                else {
                    return ResponseEntity
                            .status(HttpStatus.ACCEPTED)
                            .body(userSchedule.getId());
                }
            }
        }

        // Record does not exist, continue
        if (scheduleControllerSaveRequest.getSchedule().getUserEmail() == null) {
            return ResponseEntity
                .status(HttpStatus.NOT_ACCEPTABLE)
                .body("User email cannot be null");
        } else {
            String currentUserEmail = userController.getUserEmail();
            if (!scheduleControllerSaveRequest.getSchedule().getUserEmail().equals(currentUserEmail)) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Authenticated user's  email does not match the schedule's email property.");
            } else {
                Schedule savedSchedule = scheduleRepository.save(scheduleControllerSaveRequest.getSchedule());
                if (isCustom) {
                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(savedSchedule);
                }
                else {
                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(savedSchedule.getId());
                }
            }
        }
    }

    /**
     * Protected REST endpoint for getting all schedules for a given userEmail. If the authenticated user's email
     * does not match the requested userEmail, then this method returns a 400-level response.
     * @param userEmail The userEmail to filter schedules on.
     * @return A list of schedules if the request is valid.
     */
    @GetMapping(value = "/")
    @Secured("ROLE_USER")
    public ResponseEntity getAllSchedulesForEmail() {

        String authenticatedUsersEmail = userController.getUserEmail();

        if (authenticatedUsersEmail == null) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("");
        } else {
            return ResponseEntity
                .status(HttpStatus.OK)
                .body(scheduleRepository.findByUserEmail(authenticatedUsersEmail));
        }
    }

    @PostMapping(value = "/delete")
    @Secured("ROLE_USER")
    public ResponseEntity deleteSchedule(@RequestBody Schedule schedule) {

        String authenticatedUsersEmail = userController.getUserEmail();

        if (!authenticatedUsersEmail.equals(schedule.getUserEmail())) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Authenticated user's email does not match schedule's email");
        } else {
            try {
                scheduleRepository.delete(schedule);
            } catch(Exception e) {
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Schedule was not successfully deleted.");
            }
            return ResponseEntity
                .status(HttpStatus.OK)
                .body(schedule.getId());
        }
    }

    /**
     * A protected REST endpoint to patch schedules. If the user is not authenticated, the PATCH request fails.
     * The method can use any of the method described in http://jsonpatch.com/.
     * @param schedule A schedule to save.
     * @return A response entity with no body.
     */
        @PatchMapping(value = "/{id}", consumes = "application/json")
        @Secured("ROLE_USER")
        public ResponseEntity updateSchedule(@PathVariable String id, @RequestBody JsonPatch patch){
          Optional<Schedule> optional = scheduleRepository.findById(id);
          String email = userController.getUserEmail();
          Schedule schedulePatched;

          if(optional.isPresent()){
            if (!email.equals(optional.get().getUserEmail())) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Authenticated user's email does not match schedule's email");
            } else if (optional.get().getUserEmail() == null) {
                return ResponseEntity
                    .status(HttpStatus.NOT_ACCEPTABLE)
                    .body("User email cannot be null");
            } else {
              try {
                  schedulePatched = applyPatchToSchedule(patch, optional.get());
                  scheduleRepository.save(schedulePatched);
              } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Schedule was not successfully updated.");
              }
            return ResponseEntity
               .status(HttpStatus.OK)
               .body(schedulePatched);
            }
          } else {
              return ResponseEntity
                  .status(HttpStatus.NOT_FOUND)
                  .body("A schedule with ID "+id+" does not exist in the database.");
          }
    }

    private Schedule applyPatchToSchedule(JsonPatch patch, Schedule targetSchedule) throws JsonPatchException, JsonProcessingException {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        JsonNode patched = patch.apply(objectMapper.convertValue(targetSchedule, JsonNode.class));
        return objectMapper.treeToValue(patched, Schedule.class);
    }
 }
