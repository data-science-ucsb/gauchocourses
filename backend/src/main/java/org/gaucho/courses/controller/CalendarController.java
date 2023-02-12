package org.gaucho.courses.controller;

import java.io.IOException;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

  private final Calendar calendarService;

  public CalendarController(Calendar calendarService) {
    this.calendarService = calendarService;
  }

  @PostMapping("/create-event")
  public void createEvent(@RequestBody Event event) throws IOException {
    calendarService.events().insert("primary", event).execute();
  }
}
