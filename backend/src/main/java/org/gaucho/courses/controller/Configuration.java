package org.gaucho.courses.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("api/configuration/")
public class Configuration {

    private final CacheControl cacheControl = CacheControl
            .maxAge(24, TimeUnit.HOURS)
            .noTransform()
            .cachePublic();

    /**
     * Exposes configuration to the client-side application such as colors, university names, etc.
     * @return A FrontendConfiguration object.
     */
    @GetMapping(value = "/")
    public ResponseEntity<FrontendConfiguration> getFrontendConfiguration() {
        FrontendConfiguration config = new FrontendConfiguration();
        return ResponseEntity
                .status(200)
                .cacheControl(cacheControl)
                .body(config);
    }

    /**
     * A collection of key-value pairs to configure the presentation of the frontend application. The values are derived
     * from environment variables.
     */
    public class FrontendConfiguration implements Serializable {

        private static final long serialVersionUID = 1L;

        @JsonProperty("PRIMARY_COLOR") private String PRIMARY_COLOR;
        @JsonProperty("SECONDARY_COLOR") private String SECONDARY_COLOR;
        @JsonProperty("TERTIARY_COLOR") private String TERTIARY_COLOR;
        @JsonProperty("SITE_NAME") private String SITE_NAME;
        @JsonProperty("ORGANIZATION_NAME") private String ORGANIZATION_NAME;

        public FrontendConfiguration() {
            PRIMARY_COLOR = getEnvOrDefault("PRIMARY_COLOR", "#047c91");
            SECONDARY_COLOR = getEnvOrDefault("SECONDARY_COLOR", "#a6192e");
            TERTIARY_COLOR = getEnvOrDefault("TERTIARY_COLOR", "orange");
            SITE_NAME = getEnvOrDefault("SITE_NAME", "CrunchTime");
            ORGANIZATION_NAME = getEnvOrDefault("ORGANIZATION_NAME", "CrunchTime Software");
        }

        private String getEnvOrDefault(String name, String defaultValue) {
            String value = System.getenv(name);
            return (value == null) ? defaultValue : value;
        }
    }
}
