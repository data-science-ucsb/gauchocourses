package org.gaucho.courses.domain.remote;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.io.Serializable;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "geCode",
        "geCollege"
})
public class GeneralEducation implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("geCode")
    private String geCode;
    @JsonProperty("geCollege")
    private String geCollege;

    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("geCode")
    public String getGeCode() {
        return geCode;
    }

    @JsonProperty("geCode")
    public void setGeCode(String geCode) {
        this.geCode = geCode;
    }

    @JsonProperty("geCollege")
    public String getGeCollege() {
        return geCollege;
    }

    @JsonProperty("geCollege")
    public void setGeCollege(String geCollege) {
        this.geCollege = geCollege;
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