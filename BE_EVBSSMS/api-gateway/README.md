✅ application.yml (Base Config)
Routes cho tất cả services (auth-user, station, booking, billing)
CORS configuration cho frontend
Profile mặc định: dev
Logging config
✅ application-dev.yml (IDE Development)
Server port: 9000
Eureka URL: localhost:8761 (Docker exposed)
Discovery locator: enabled
Logging: DEBUG
✅ application-prod.yml (Docker Production)
Server port: 8080 (container)
Eureka URL: eureka-server:8761 (container name)
Discovery locator: enabled
Logging: INFO/WARN