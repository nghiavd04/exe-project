# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

<<<<<<< HEAD
# Install Tesseract OCR + Vietnamese language pack
RUN apt-get update && \
    apt-get install -y \
        tesseract-ocr \
        tesseract-ocr-eng \
        tesseract-ocr-vie \
        libtesseract-dev \
        libleptonica-dev && \
    rm -rf /var/lib/apt/lists/*

=======
# Install Tesseract OCR and Vietnamese language pack
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-vie && rm -rf /var/lib/apt/lists/*

# Copy the built artifact from the build stage
>>>>>>> 131d347 (add screen time upload functionality with OCR support; implement related services, models, and UI components)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]