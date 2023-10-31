# Docker multi-stage build

FROM --platform=linux/amd64 maven:3.6.3-openjdk-8
# FROM maven:3.6.3-openjdk-8

ADD . /project
WORKDIR /project

RUN mvn clean install -P prod -B -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

FROM openjdk:8-jdk

LABEL maintainer="DS@UCSB"

# COPY --from=0 /project/backend/target/*.jar /app.jar
COPY /backend/target/*.jar /app.jar

ENV JAVA_OPTS=""

EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]