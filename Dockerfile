FROM eclipse-temurin:17-jdk

WORKDIR /app

RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "target/url-shortener-1.0.0.jar"]