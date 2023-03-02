package org.gaucho.courses.DTO;

import lombok.Data;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.remote.CustomEvent;

import java.util.ArrayList;
import java.util.List;

@Data
public class ScheduleControllerRequest {

    private List<ClassSection> classSections = new ArrayList<>();
    private List<CustomEvent> customEvents = new ArrayList<>();

    //private int pageNumber;
    private int pageSize = 30;
    private int lastScheduleIndex = 0;

}
