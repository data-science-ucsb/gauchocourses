package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

import lombok.Data;

@Data
public class Department implements Serializable { 

    private static final long serialVersionUID = 1L;

    @JsonProperty("deptCode")
    private String deptCode;
    
    @JsonProperty("deptTranslationShort") 
    private String deptTranslationShort;
    
    @JsonProperty("deptTranslation") 
    private String deptTranslation;

    @JsonProperty("collegeCode")
    private String collegeCode;
    
    @JsonProperty("divisionCode")
    private String divisionCode;
    
    @JsonProperty("orgCode") 
    private String orgCode;
    
    @JsonProperty("inactive")
    private String inactive;
}