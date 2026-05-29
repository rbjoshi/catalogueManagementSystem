FROM gradle:8.6-jdk17-alpine AS build
WORKDIR /app
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN mkdir -p /app/uploads/pdf
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
