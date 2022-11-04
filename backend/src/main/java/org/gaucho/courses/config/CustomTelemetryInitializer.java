package org.gaucho.courses.config;

import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.Telemetry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CustomTelemetryInitializer implements TelemetryInitializer {

    /**
     * Get the slot name from the env var and attach it to the outgoing telemetry.
     * @param telemetry Outgoing telemetry
     */
    @Override
    public void initialize(Telemetry telemetry) {
        final String SLOT_ENV_VAR = "SLOT_NAME";
        final String slot = System.getenv(SLOT_ENV_VAR);
        if (slot != null) {
            log.info("Tagging telemetry with slot name: "+slot);
            telemetry.getProperties().put(SLOT_ENV_VAR, slot);
        }
    }
}
