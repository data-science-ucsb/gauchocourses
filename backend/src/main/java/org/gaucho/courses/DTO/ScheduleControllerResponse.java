package org.gaucho.courses.DTO;

import lombok.Data;
import org.gaucho.courses.domain.scheduling.Schedule;

import java.util.List;

@Data
public class ScheduleControllerResponse {

    List<Schedule> schedules;
    List<String> warnings;
    List<String> errors;
    int lastScheduleIndex;

}
