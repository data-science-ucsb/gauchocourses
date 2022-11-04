package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a course in a given quarter. One "Class" maps to one or more Lectures, and one Lecture maps to
 * zero or more Sections.
 */
@JsonPropertyOrder({
    "quarter",
    "courseId",
    "title",
    "contactHours",
    "description",
    "college",
    "objLevelCode",
    "subjectArea",
    "unitsFixed",
    "unitsVariableHigh",
    "unitsVariableLow",
    "delayedSectioning",
    "inProgressCourse",
    "gradingOption",
    "instructionType",
    "onLineCourse",
    "deptCode",
    "generalEducation",
    "classSections"
})
@Data
@EqualsAndHashCode
public class Class implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("quarter")        private String quarter;
    @JsonProperty("courseId")       private String courseId;
    @JsonProperty("title")          private String title;
    @JsonProperty("contactHours")   private Integer contactHours;
    @JsonProperty("description")    private String description;
    @JsonProperty("college")        private String college;
    @JsonProperty("objLevelCode")   private String objLevelCode;
    @JsonProperty("subjectArea")    private String subjectArea;
    @JsonProperty("unitsFixed")     private Integer unitsFixed;
    @JsonProperty("unitsVariableHigh")  private Integer unitsVariableHigh;
    @JsonProperty("unitsVariableLow")   private Integer unitsVariableLow;
    @JsonProperty("delayedSectioning")  private String delayedSectioning;
    @JsonProperty("inProgressCourse")   private String inProgressCourse;
    @JsonProperty("gradingOption")      private String gradingOption;
    @JsonProperty("instructionType")    private String instructionType;
    @JsonProperty("onLineCourse")       private Boolean onLineCourse;
    @JsonProperty("deptCode")           private String deptCode;
    @JsonProperty("generalEducation")   private List<GeneralEducation> generalEducation = null;
    @JsonProperty("classSections")      private List<ClassSection> classSections = null;

    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    // Constructors

    /**
     * JPA requires a default, no-args constructor.
     */
    public Class() {}

    /**
     * Utility method to getCombination the full course name. (Prefix, number, suffix in one string).
     */
    public String getFullCourseNumber() {
        return getDeptCode()+getCourseNumberPrefix()+getCourseNumber()+getCourseNumberSuffix();
    }

    /**
     * Helper method to getCombination the courseId. Removes whitespace. From the API docs:
     * 13 character course Id with format SSSSSPPPNNNNUUU , Fist 5 char is course subject, Next 3 char is course prefix then next 3 char is course number and last 2 char is course suffix.
     * For example 'ES 1- 16B ' can be broken down in subject 'ES ' prefix '1- ' number ' 16' suffix 'B
     * @param start Start index (inclusive)
     * @param end End index (inclusive)
     * @return The split string with whitespace removed
     */
    private String getCourseIdSubString(int start, int end) {
        String substring = getCourseId().substring(start, end);
        return substring.replaceAll(" ", "");
    }

    private String getCourseNumberPrefix() {
        return getCourseIdSubString(5, 8);
    }

    private String getCourseNumber() {
        return getCourseIdSubString(8,11);
    }

    private String getCourseNumberSuffix() {
        return getCourseIdSubString(11, 13);
    }

    public String toString() {
        return "Class "+this.getFullCourseNumber()+" with "+this.getClassSections().size()+" class sections.";
    }
}
