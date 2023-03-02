package org.gaucho.courses.DTO;

import lombok.Data;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.remote.CustomEvent;
import org.gaucho.courses.domain.scheduling.Schedule;

import java.util.ArrayList;
import java.util.List;


@Data
public class ScheduleControllerSaveRequest {
    private List<ClassSection> selectedClassSections = new ArrayList<>();
    private List<ClassSection> scheduledClassSections = new ArrayList<>();
    private List<CustomEvent> customEvents = new ArrayList<>();
    private Schedule schedule = new Schedule();
}
