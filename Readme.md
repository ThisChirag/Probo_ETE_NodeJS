# Probo Project

## 🚀 Overview
Built a real-time opinion trading platform (like a prediction market) where users place bets on various events.
- Utilized Node.js, Redis Pub/Sub, and WebSockets for instant data flow and event updates.
- Leveraged Docker for consistent development and production environments.
- Future improvements include multi-stage Docker and distroless builds, plus potential Kubernetes deployments.

### 🌟 Features
- Real-time communication using WebSocket.
- Pub/Sub mechanism with Redis for inter-service communication.
- Queue management for order processing.
- API Server for handling client requests and database operations.
- Modular architecture ensuring easy scalability and maintainability.

## 🏗️ Architecture
The architecture of Probo consists of the following components:

1. **API Server**: Handles client requests, interacts with the database, and manages the order queue.
2. **Engine Server**: Processes tasks from the order queue and sends real-time updates via WebSocket.
3. **WebSocket Server**: Manages real-time communication with clients.
4. **Admin Web**: Frontend application for admin functionalities.
5. **Web**: Main frontend application for user interactions.
6. **Database Updation Server**: Ensures database consistency and interacts with Kafka for message processing.
7. **Message Broker**: Kafka is used for managing inter-service communication and ensuring reliable message delivery.

![Screenshot 2024-12-02 at 3 22 49 PM](https://github.com/user-attachments/assets/380ac475-47f0-42b2-984f-59e0fb3695c6)

- The system incorporates Redis for Pub/Sub and queue management, ensuring efficient communication and task handling.

## 🔧 Installation
Follow these steps to set up and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/ThisChirag/Probo_ETE_NodeJS.git
   cd probo
   ```

2. Navigate to each service directory (e.g., `admin-web`, `api-server`, `engine`, `web`, `websocket`) and install the required dependencies:
   ```bash
   cd <service-directory>
   pnpm install
   ```

3. Ensure that all necessary services such as Redis, Kafka, and the database are running locally or are accessible.

4. Start each service by navigating to its directory and running the respective start command. Example for starting the API server:
   ```bash
   pnpm start
   ```

5. For frontend services (`admin-web`, `web`), ensure the environment variables are set in the `.env` files, then build and run the applications:
   ```bash
   pnpm run build
   pnpm start
   ```

6. Access the applications in your browser:
   - Admin Web: `http://localhost:<admin-web-port>`
   - Web: `http://localhost:<web-port>`

## 📋 Prerequisites
- Node.js (16.x or higher)
- pnpm (Package Manager)
- Docker (optional, for containerized services)
- Redis
- Kafka
- PostgreSQL (or the database of your choice)

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request with detailed information about your changes.

## 📜 License
This project is licensed under the [MIT License](./LICENSE).

