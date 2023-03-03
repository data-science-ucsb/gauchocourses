package org.gaucho.courses.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.core.Authentication;
import org.gaucho.courses.DTO.CalendarEvent;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventReminder;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.Calendar;

import java.io.IOException;
import java.security.GeneralSecurityException;

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
@RequestMapping("api/calendar/")
public class CalendarController {
    private final Calendar service;

    public CalendarController() throws GeneralSecurityException, IOException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
        // Retrieve access token from the security context
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // String accessToken = OAuth2AuthenticationToken(authentication);

        // Retrieve access token from the security context
        String accessToken = " ";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            accessToken = oauthToken.getPrincipal().getAttribute("access_token");
        }

        // Create Google credentials using the access token
        Credential credential = new GoogleCredential().setAccessToken(accessToken);
        service = new Calendar.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName("GauchoCourses")
                .build();
    }

// /api/calendar/events?start=2020-01-01&end=2020-01-31&timezone=America/Los_Angeles&maxResults=10
    @PostMapping(value = "/events", consumes = "application/json")
    public ResponseEntity<?> insertEvent(@RequestBody CalendarEvent calEvent) throws IOException {
        Event event = new Event()
            .setSummary(calEvent.getSummary());
            // .setLocation("800 Howard St., San Francisco, CA 94103")
            // .setDescription("A chance to hear more about Google's developer products.");

        DateTime startDateTime = new DateTime(calEvent.getStart());
        EventDateTime start = new EventDateTime()
            .setDateTime(startDateTime)
            .setTimeZone("America/Los_Angeles");
        event.setStart(start);

        DateTime endDateTime = new DateTime(calEvent.getEnd());
        EventDateTime end = new EventDateTime()
            .setDateTime(endDateTime)
            .setTimeZone("America/Los_Angeles");
        event.setEnd(end);

        // String[] recurrence = new String[] {"RRULE:FREQ=DAILY;COUNT=2"};
        // event.setRecurrence(Arrays.asList(recurrence));

        // EventReminder[] reminderOverrides = new EventReminder[] {
        //     new EventReminder().setMethod("email").setMinutes(24 * 60),
        //     new EventReminder().setMethod("popup").setMinutes(10),
        // };
        // Event.Reminders reminders = new Event.Reminders()
        //     .setUseDefault(false)
        //     .setOverrides(Arrays.asList(reminderOverrides));
        // event.setReminders(reminders);


        String calendarId = "primary";
        com.google.api.services.calendar.model.Event calendarEvent = new com.google.api.services.calendar.model.Event();
        System.out.printf("Event created: %s\n", event.getHtmlLink());
        try {
            calendarEvent = service.events().insert(calendarId, event).execute();
            return ResponseEntity.ok(calendarEvent);
        } catch (GoogleJsonResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getDetails());
        }


        // // create a Google Calendar event object from the request body
       
        // calendarEvent.setSummary(event.getSummary());
        // // DateTime start = event.getStart();
        // EventDateTime startDateTime = new EventDateTime().setDateTime(event.getStart());
        // calendarEvent.setStart(startDateTime);
        // // DateTime end = event.getEnd();
        // EventDateTime endDateTime = new EventDateTime().setDateTime(event.getEnd());
        // calendarEvent.setEnd(endDateTime);

        // insert the event into the primary calendar
        
    }
}

