
FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw -B -DskipTests clean package
RUN ls -la target/

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar target/docurisk-backend-1.0.0-SNAPSHOT.jar"]
