FROM golang:1.26-alpine AS build

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/main.go ./
RUN go build -o engine main.go

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/engine .
EXPOSE 8000
CMD ["./engine"]
