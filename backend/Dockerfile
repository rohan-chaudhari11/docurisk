
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -DskipTests clean package
RUN find target -maxdepth 1 -name "*.jar" -print
EXPOSE 8080
CMD ["sh", "-c", "JAR=$(find target -maxdepth 1 -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1); test -n \"$JAR\" && exec java -Dserver.port=${PORT:-8080} -jar \"$JAR\""]
