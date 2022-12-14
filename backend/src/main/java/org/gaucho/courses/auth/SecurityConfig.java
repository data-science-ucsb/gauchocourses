package org.gaucho.courses.auth;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import lombok.extern.slf4j.Slf4j;

/**
 * https://spring.io/guides/tutorials/spring-boot-oauth2/
 * https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#oauth2login-provide-websecurityconfigureradapter
 * https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/htmlsingle/#boot-features-security-oauth2-client
 */
@Slf4j
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    /**
     * Security adapter applied to every request.
     * Default login page: "/oauth2/authorization/google" (NOTE: No ending slash)
     * @param http HttpSecurity bean
     * @throws Exception If there are problems lol
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/h2-console/**", "/", "/**")
                .permitAll()
                .and()
            .oauth2Login()
                .defaultSuccessUrl("/#/")
                .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/#/")
                .and()
            .headers()
                .frameOptions()
                .disable()
                .and()
            .csrf()
                .disable();
    }
}