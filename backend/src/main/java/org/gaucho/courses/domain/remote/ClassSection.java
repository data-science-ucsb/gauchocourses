package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.domain.core.Event;

import javax.persistence.Transient;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonPropertyOrder({
        "enrollCode",
        "section",
        "session",
        "timeLocations",
        "classClosed",
        "courseCancelled",
        "gradingOptionCode",
        "enrolledTotal",
        "maxEnroll",
        "secondaryStatus",
        "departmentApprovalRequired",
        "instructorApprovalRequired",
        "restrictionLevel",
        "restrictionMajor",
        "restrictionMajorPass",
        "restrictionMinor",
        "restrictionMinorPass",
        "concurrentCourses",
        "instructors"
})
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true)
public class ClassSection extends Event implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("enrollCode")             private String enrollCode;
    @JsonProperty("section")                private String section;
    @JsonProperty("session")                private String session;
    @JsonProperty("classClosed")            private String classClosed;
    @JsonProperty("courseCancelled")        private String courseCancelled;
    @JsonProperty("gradingOptionCode")      private String gradingOptionCode;
    @JsonProperty("enrolledTotal")          private Integer enrolledTotal;
    @JsonProperty("maxEnroll")              private Integer maxEnroll;
    @JsonProperty("secondaryStatus")        private String secondaryStatus;
    @JsonProperty("departmentApprovalRequired")     private Boolean departmentApprovalRequired;
    @JsonProperty("instructorApprovalRequired")     private Boolean instructorApprovalRequired;
    @JsonProperty("restrictionLevel")       private String restrictionLevel;
    @JsonProperty("restrictionMajor")       private String restrictionMajor;
    @JsonProperty("restrictionMajorPass")   private String restrictionMajorPass;
    @JsonProperty("restrictionMinor")       private String restrictionMinor;
    @JsonProperty("restrictionMinorPass")   private String restrictionMinorPass;

    @JsonProperty("concurrentCourses")      private List<String> concurrentCourses = null;
    @JsonProperty("instructors")            private List<Instructor> instructors = null;

    // Calculated by the frontend, not an API-native property.
    @JsonProperty("lectureSectionGroup")    private String LectureSectionGroup;

    // Calculated by the frontend, not an API-native property.
    @JsonProperty("courseId")               private String courseId;

    @JsonProperty("isLecture")
    public boolean isLecture(){
        return this.getSection().endsWith("00");
    }

    @JsonIgnore
    @Transient
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    public ClassSection() { }
}
