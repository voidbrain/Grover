# Docker Compose Project

This project utilizes Docker Compose to manage multiple services, including a base container with a web client, a web server, a database, a scheduler, and a logging service. Below are the details for each component of the project.

## Project Structure

```
docker-compose-project
├── docker-compose.yml       # Defines the services and configurations for the Docker containers
├── base                     # Contains the base container setup
│   ├── Dockerfile           # Instructions to build the base container
│   └── webclient            # Web client files
│       └── index.html       # Main HTML file for the web client
├── webserver                # Contains the web server setup
│   └── Dockerfile           # Instructions to build the web server container
├── db                       # Contains the database setup
│   └── Dockerfile           # Instructions to build the database container
├── scheduler                # Contains the scheduler setup
│   └── Dockerfile           # Instructions to build the scheduler container
├── logs                     # Contains the logging setup
│   └── Dockerfile           # Instructions to build the logs container
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the Repository**: 
   Clone this repository to your local machine.

   ```bash
   git clone <repository-url>
   cd docker-compose-project
   ```

2. **Build the Containers**: 
   Use Docker Compose to build the containers defined in the `docker-compose.yml` file.

   ```bash
   docker-compose build
   ```

3. **Run the Services**: 
   Start the services using Docker Compose.

   ```bash
   docker-compose up
   ```

4. **Access the Web Client**: 
   Open your web browser and navigate to `http://localhost:PORT`, replacing `PORT` with the port number specified in the `docker-compose.yml` file for the web client.

## Usage Guidelines

- Ensure Docker and Docker Compose are installed on your machine.
- Modify the `docker-compose.yml` file as needed to configure environment variables or dependencies for your services.
- Each service can be scaled independently by adjusting the `docker-compose.yml` file.

## Additional Information

For more details on each service, refer to the respective `Dockerfile` located in each service's directory.