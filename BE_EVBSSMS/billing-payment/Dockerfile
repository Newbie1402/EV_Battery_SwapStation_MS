# Multi-stage Dockerfile: build with Maven then run with Eclipse Temurin JRE
# Stage 1: build the Spring Boot app
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace
# Copy project files. Copying pom.xml first helps leverage Docker cache for dependencies.
COPY pom.xml ./
# If project uses .mvn wrapper or other files, copy them too
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd ./
# Copy source
COPY src/ src/
# Build the application (skip tests for faster build)
RUN mvn -B -DskipTests clean package

# Stage 2: runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
ARG JAR_FILE=/workspace/target/*.jar
# Copy the built jar from the build stage
COPY --from=build ${JAR_FILE} app.jar
# Expose container port (Spring Boot default 8080)
EXPOSE 8080
# Default command
ENTRYPOINT ["java","-jar","/app/app.jar"]
