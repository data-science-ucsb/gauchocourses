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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
// import GoogleCredential
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
// import DateTime
import com.google.api.client.util.DateTime;
// import GoogleNetHttpTransport
import com.google.api.client.http.javanet.NetHttpTransport;


import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/events")
@Slf4j


class GoogleCalController {
    
    public ResponseEntity<String> getEvents(@AuthenticationPrincipal OAuth2User oAuth2User, 
            @RequestParam(value = "sdate") String sdate, 
            @RequestParam(value = "edate") String edate, 
            @RequestParam(value = "q") String q) {
        com.google.api.services.calendar.model.Events eventList;
        String message;
        try {
            CustomOAuth2User customOAuth2User = (CustomOAuth2User)oAuth2User;
            String token = customOAuth2User.getToken();
            GoogleCredential credential = new GoogleCredential().setAccessToken(token);
            
            final DateTime date1 = new DateTime(sdate + "T00:00:00");
            final DateTime date2 = new DateTime(edate + "T23:59:59");
            
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME).build();
            i events = service.events();
            eventList = events.list("primary").setTimeZone("Asia/Kolkata").setTimeMin(date1).setTimeMax(date2).setQ(q).execute();
            message = eventList.getItems().toString();
            System.out.println("My:" + eventList.getItems());
        } catch (Exception e) {
            
            message = "Exception while handling OAuth2 callback (" + e.getMessage() + ")."
                    + " Redirecting to google connection status page.";
        }

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}