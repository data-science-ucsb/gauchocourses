package org.gaucho.courses.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Configuration
public class CalendarConfig {

  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  @Bean
  public Calendar calendarService() throws GeneralSecurityException, IOException {
    HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    Calendar calendar = new Calendar.Builder(httpTransport, JSON_FACTORY, null)
        .setApplicationName("Your Application Name")
        .build();
    return calendar;
  }
}
