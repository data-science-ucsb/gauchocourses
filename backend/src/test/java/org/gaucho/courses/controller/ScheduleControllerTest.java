package org.gaucho.courses.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import org.assertj.core.util.Lists;
import org.gaucho.courses.DTO.ScheduleControllerRequest;
import org.gaucho.courses.DTO.ScheduleControllerResponse;
import org.gaucho.courses.DTO.ScheduleControllerSaveRequest;
import org.gaucho.courses.TestObjects;
import org.gaucho.courses.auth.UserController;
import org.gaucho.courses.domain.scheduling.Schedule;
import org.gaucho.courses.repository.ScheduleRepository;
import org.junit.Assert;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithAnonymousUser;

import java.io.IOException;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

//@RunWith(SpringJUnit4ClassRunner.class)
@RunWith(MockitoJUnitRunner.class)
class ScheduleControllerTest {

    // https://docs.spring.io/spring-security/site/docs/5.0.x/reference/html/test-method.html
    private TestObjects testObjects = new TestObjects();

    @InjectMocks
    private ScheduleController controller;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private UserController userController;

    @BeforeEach
    private void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    // Saving Schedules ....

    @Test
    void whenUserIsAuthenticated_thenUserCanSaveNewSchedule() {
        Schedule schedule = testObjects.getSchedule();
        schedule.setUserEmail("dummy_email@email.com");
        schedule.setQuarter("20192");

        Schedule savedScheduleMock = testObjects.getSchedule();
        final String id = "1";
        savedScheduleMock.setId(id);

        when(scheduleRepository.save(schedule)).thenReturn(savedScheduleMock);
        when(userController.getUserEmail()).thenReturn("dummy_email@email.com");

        ScheduleControllerSaveRequest savableSchedule = new ScheduleControllerSaveRequest();
        savableSchedule.setSchedule(schedule);
        savableSchedule.setCustomEvents(null);
        savableSchedule.setScheduledClassSections(null);
        savableSchedule.setSelectedClassSections(null);
        ResponseEntity response = controller.saveSchedule(savableSchedule);

        Assert.assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Assert.assertEquals(id, response.getBody());
    }

    @Test
    @WithAnonymousUser
    void whenUserIsUnAuthenticated_thenUserCannotSaveSchedule() {
        Schedule schedule = testObjects.getSchedule();
        schedule.setUserEmail("dummy_email@email.com");
        schedule.setQuarter("20192");

        ScheduleControllerSaveRequest savableSchedule = new ScheduleControllerSaveRequest();
        savableSchedule.setSchedule(schedule);
        savableSchedule.setCustomEvents(null);
        savableSchedule.setScheduledClassSections(null);
        savableSchedule.setSelectedClassSections(null);

        ResponseEntity response = controller.saveSchedule(savableSchedule);

        Assert.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void whenAScheduleWasPreviouslySaved_thenItCanBeUpdated() throws IOException {
        Schedule savedSchedule = testObjects.getSchedule();
        final String id = "1";
        savedSchedule.setUserEmail("dummy_email@email.com");
        savedSchedule.setQuarter("20192");
        savedSchedule.setId(id);

        when(userController.getUserEmail()).thenReturn("dummy_email@email.com");
        when(scheduleRepository.findById(any())).thenReturn(Optional.of(savedSchedule));
        when(scheduleRepository.save(any())).thenReturn(savedSchedule);

        ScheduleControllerSaveRequest savableSchedule = new ScheduleControllerSaveRequest();
        savableSchedule.setSchedule(savedSchedule);
        savableSchedule.setCustomEvents(null);
        savableSchedule.setScheduledClassSections(null);
        savableSchedule.setSelectedClassSections(null);

        controller.saveSchedule(savableSchedule);

        String json = "[{\"op\": \"replace\", \"path\": \"/name\", \"value\": \"Schedule New\"}]";

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonP = mapper.readTree(json);
        JsonPatch patch = JsonPatch.fromJson(jsonP);

        ResponseEntity response = controller.updateSchedule(id, patch);

        Assert.assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void whenEmailDoesNotMatchAuthenticatedUser_thenTheRecordIsNotSaved() {
        Schedule schedule = testObjects.getSchedule();
        schedule.setUserEmail("dummy_email@email.com");
        schedule.setQuarter("20192");

        when(userController.getUserEmail()).thenReturn("different_email@email.com");

        ScheduleControllerSaveRequest savableSchedule = new ScheduleControllerSaveRequest();
        savableSchedule.setSchedule(schedule);
        savableSchedule.setCustomEvents(null);
        savableSchedule.setScheduledClassSections(null);
        savableSchedule.setSelectedClassSections(null);

        ResponseEntity response = controller.saveSchedule(savableSchedule);

        Assert.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // Generating schedules...

    @Test
    void whenSchedulesAreRequested_thenSchedulesAreReturned() {
        ScheduleControllerRequest request = new ScheduleControllerRequest();
        request.setClassSections(
            Lists.list(
                testObjects.getLectureA1(),
                testObjects.getSectionA1_1(),
                testObjects.getSectionA1_2(),
                testObjects.getLectureB(),
                testObjects.getSectionB_1()));

        ResponseEntity response = controller.generateSchedules(request);
        ScheduleControllerResponse responseBody = (ScheduleControllerResponse) response.getBody();

        Assert.assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        Assert.assertEquals(2, responseBody.getSchedules().size());
        Assert.assertEquals(2, responseBody.getLastScheduleIndex());
    }

    @Test
    void whenGivenLecturesConflict_thenAnErrorCodeIsReturned() {
        ScheduleControllerRequest request = new ScheduleControllerRequest();
        request.setClassSections(
            Lists.list(testObjects.getLectureA1(), testObjects.getLectureConflictsWithLectureA()));

        ResponseEntity response = controller.generateSchedules(request);

        Assert.assertEquals(HttpStatus.NOT_ACCEPTABLE, response.getStatusCode());
    }

}