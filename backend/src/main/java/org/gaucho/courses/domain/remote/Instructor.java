package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.*;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "instructor",
        "functionCode"
})
public class Instructor implements Serializable {
    
    private static final long serialVersionUID = 1L;

    @JsonProperty("instructor")
    private String instructor;
    @JsonProperty("functionCode")
    private String functionCode;

    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("instructor")
    public String getInstructor() {
        return instructor;
    }

    @JsonProperty("instructor")
    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    @JsonProperty("functionCode")
    public String getFunctionCode() {
        return functionCode;
    }

    @JsonProperty("functionCode")
    public void setFunctionCode(String functionCode) {
        this.functionCode = functionCode;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
