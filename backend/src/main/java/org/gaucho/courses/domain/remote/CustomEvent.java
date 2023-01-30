package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.domain.core.Event;

import java.io.Serializable;

@JsonPropertyOrder({
        "name",
        "timeLocations",
        "backgroundColor",
        "borderColor"
})
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true)
public class CustomEvent extends Event implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("name") private String name;
    @JsonProperty("backgroundColor")             private String backgroundColor;
    @JsonProperty("borderColor")                private String borderColor;

    public CustomEvent() { }
}