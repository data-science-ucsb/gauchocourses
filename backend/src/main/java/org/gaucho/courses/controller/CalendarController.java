package org.gaucho.courses.controller;

import org.gaucho.courses.DTO.Event;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;


import com.google.api.client.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.Lists;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventReminder;
import com.google.api.services.calendar.model.Events;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;

import java.io.FileReader;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TimeZone;


// @RestController
// @RequestMapping("/api/calendar")
// public class CalendarController {

//   private final Calendar calendarService;

//   public CalendarController(Calendar calendarService) {
//     this.calendarService = calendarService;
//   }

//   @PostMapping("/create-event")
//   public void createEvent(@RequestBody Event event) throws IOException {
//     calendarService.events().insert("primary", event).execute();
//   }
// }

// When we have the google-api-services-calendar dependency in our pom.xml, we can use the Calendar class to interact with the Google Calendar API
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    private final Calendar service;

    public CalendarController() throws GeneralSecurityException, IOException {
        // build the Google Calendar service object with credentials
        // You'll need to supply your own client secrets file and credentials object
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
        GoogleClientSecrets secrets = GoogleClientSecrets.load(jsonFactory,
                new FileReader("path/to/client_secrets.json"));
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, jsonFactory, secrets, Collections.singleton(CalendarScopes.CALENDAR))
                .build();
        Credential credential = new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");
        service = new Calendar.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName("GauchoCourses")
                .build();
    }

// /api/calendar/events?start=2020-01-01&end=2020-01-31&timezone=America/Los_Angeles&maxResults=10
    @PostMapping("/events")
    public ResponseEntity<?> insertEvent(@RequestBody Event event) throws IOException {
        // create a Google Calendar event object from the request body
        com.google.api.services.calendar.model.Event calendarEvent = new com.google.api.services.calendar.model.Event();
        calendarEvent.setSummary(event.getTitle());
        DateTime start = new DateTime(event.getStartTime(), TimeZone.getTimeZone("America/Los_Angeles"));
        EventDateTime startDateTime = new EventDateTime().setDateTime(start);
        calendarEvent.setStart(startDateTime);
        DateTime end = new DateTime(event.getEndTime(), TimeZone.getTimeZone("America/Los_Angeles"));
        EventDateTime endDateTime = new EventDateTime().setDateTime(end);
        calendarEvent.setEnd(endDateTime);

        // insert the event into the primary calendar
        try {
            calendarEvent = service.events().insert("primary", calendarEvent).execute();
            return ResponseEntity.ok(calendarEvent);
        } catch (GoogleJsonResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getDetails());
        }
    }
}

