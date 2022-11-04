package org.gaucho.courses.controller.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@Slf4j
@Component
public class Proxy {

    @Value("${crunchtime.api.server}")
    private String SERVER;
    @Value("${crunchtime.api.port}")
    private Integer PORT;
    @Value("${crunchtime.api.scheme}")
    private String SCHEME;


    /**
     * Proxies request to SERVER and caches the response. The request body is not forwarded.
     * @param request ServletRequest object
     * @return The response from SERVER.
     */
    @Cacheable(value="remote-entity", key="#request.getQueryString()")
    public Object proxyRequest(HttpServletRequest request) {

        URI uri;
        String restOfTheUrl = request.getRequestURI().substring(7);
        String queryParams = request.getQueryString().replace("%20", " ");

        try {
            uri = new URI(
                    SCHEME,
                    null,
                    SERVER,
                    PORT,
                    restOfTheUrl,
                    queryParams,
                    null);

            RestTemplate restTemplate = new RestTemplate();

            log.info("Proxying request from "+request.getRequestURI()+" to "+uri.toString());
            return restTemplate.exchange(uri, HttpMethod.GET, null, Object.class).getBody();

        } catch (URISyntaxException e) {
            String error = "Unable to proxy request to "+request.getRequestURI();
            log.error(error);
            e.printStackTrace();
            return null;
        }

    }
}
