# Estágio 1: Build (Compilação) usando Maven
FROM maven:3-eclipse-temurin-25 AS build
WORKDIR /app

# Copia o arquivo pom.xml e baixa as dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código fonte e compila o projeto
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Execução (Imagem mais leve, apenas com o JRE)
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copia o arquivo .jar gerado no estágio anterior
COPY --from=build /app/target/FrontEnd-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta 8080 (O Render vai mapear isso dinamicamente)
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
