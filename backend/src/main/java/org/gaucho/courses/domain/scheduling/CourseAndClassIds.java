package org.gaucho.courses.domain.scheduling;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class CourseAndClassIds implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    Long id;

    String courseId;  // ToDo: This should be a HATEOS reference

    @ElementCollection
    List<String> scheduledEnrollCodes = new ArrayList<>();  // ToDo: this should be a set

    @ElementCollection
    List<String> selectedEnrollCodes = new ArrayList<>();  // ToDo: this should be a set
}
