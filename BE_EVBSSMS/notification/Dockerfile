FROM eclipse-temurin:21-jre
WORKDIR /app
COPY ./notification/target/code-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
