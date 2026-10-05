# Imagem da API para o Render (plano gratuito: 512 MB de RAM, 0,1 CPU).

# ---- Build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Dependências primeiro: a camada é reaproveitada enquanto o pom.xml não muda.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# ---- Execução ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Heap limitado para caber nos 512 MB com metaspace e threads; só o compilador
# C1 (sobe mais rápido e usa menos memória com pouca CPU); reinicia em vez de
# ficar travado se a memória acabar.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=55 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
