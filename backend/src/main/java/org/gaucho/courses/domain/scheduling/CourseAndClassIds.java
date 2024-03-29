package org.gaucho.courses.domain.scheduling;

import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class CourseAndClassIds implements Serializable {

    private static final long serialVersionUID = 1L;

    String courseId;  // ToDo: This should be a HATEOS reference

    List<String> scheduledEnrollCodes = new ArrayList<>();  // ToDo: this should be a set

    List<String> selectedEnrollCodes = new ArrayList<>();  // ToDo: this should be a set

    String backgroundColor;
}
