package org.gaucho.courses.DTO;

import lombok.Data;

@Data
public class CalendarEvent {
    private String summary;
    private String start;
    private String end;
}