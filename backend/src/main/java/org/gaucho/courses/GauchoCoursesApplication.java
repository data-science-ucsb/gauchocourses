package org.gaucho.courses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.session.data.redis.config.ConfigureRedisAction;
import javax.annotation.PostConstruct;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@EnableCaching
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class GauchoCoursesApplication {

	@Bean
	public static ConfigureRedisAction configureRedisAction() {
		return ConfigureRedisAction.NO_OP;
	}

	// Required if embedded mongo does not work on local architecture
	static { System.setProperty("os.arch", "i686_64"); }

	public static void main(String[] args) {
		SpringApplication.run(GauchoCoursesApplication.class, args);
	}

	@Autowired
	private ObjectMapper jacksonObjectMapper;

	@PostConstruct
	public void setUp() {
		jacksonObjectMapper.registerModule(new JavaTimeModule());
	}

}
