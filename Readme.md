# TaskFlow - Personal Task Management App

A modern, scalable personal task management application built with microservices architecture, featuring real-time updates, analytics, and intelligent notifications.

## 🚀 Project Overview

TaskFlow is a comprehensive task management solution that allows users to:
- ✅ Create, edit, and delete tasks with rich metadata
- 📁 Organize tasks by custom categories
- ⏰ Set due dates and priority levels
- 📊 View detailed analytics and productivity insights
- 🔔 Receive intelligent notifications and reminders
- 🔄 Experience real-time updates across all devices

**Live Demo:** [TaskFlow Application](http://a5bfaa3b2e48047f18ccfdad4d8589ed-761cc3edb90c97ea.elb.us-west-2.amazonaws.com/login)

## 🏗️ Architecture Overview

### High-Level Architecture
```
[React Frontend] → [API Gateway] → [Microservices] → [PostgreSQL + Redis] → [Analytics]
```

### Microservices Breakdown
- **User Service (Node.js)** - Authentication, user profiles, account management
- **Task Service (Node.js)** - CRUD operations for tasks and categories
- **Analytics Service (Node.js)** - Task statistics, productivity metrics, and reports
- **Notification Service (Node.js)** - Due date reminders and alert system

### Data Flow
- Frontend communicates with services via REST APIs
- Services share data through message queues (Redis)
- Real-time updates delivered via WebSockets
- Intelligent caching layer for optimal performance

## 🛠️ Technology Stack

### Frontend
- React 19 - Modern UI library with hooks
- Vite - Fast build tool and development server
- CSS3 - Custom styling with responsive design
- Axios - HTTP client for API communication

### Backend Services
- Node.js 24 - Runtime environment
- Express.js - Web application framework
- JWT - Authentication and authorization
- PostgreSQL - Primary database for persistent data
- Redis - Caching and session management

### Infrastructure
- AWS EKS - Kubernetes orchestration
- Docker - Containerization
- Terraform - Infrastructure as Code
- PostgreSQL RDS - Managed database service
- Redis - Caching service

### DevOps & Monitoring (Planned)
- GitHub Actions - CI/CD pipeline
- ArgoCD - GitOps deployment management
- Prometheus - Metrics collection
- Grafana - Monitoring dashboards

## 📁 Project Structure

```
taskflow/
├── services/                          # Backend microservices
│   ├── user-service/                  # Authentication & user management
│   ├── task-service/                  # Task CRUD operations
│   ├── analytics-service/             # Statistics & reporting
│   └── notification-service/          # Alerts & reminders
├── frontend/                          # React application
│   └── taskflow-ui/
├── infrastructure/                    # Infrastructure as Code
│   ├── terraform/                     # AWS resource definitions
│   └── k8s/                          # Kubernetes manifests
├── scripts/                          # Deployment & setup scripts
├── docker-compose.yml                # Local development setup
└── .env.example                      # Environment configuration template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 24+ and npm
- Docker and Docker Compose
- kubectl and AWS CLI (for deployment)
- Terraform (for infrastructure)

### Local Development Setup

1. Clone the repository
```bash
git clone <repository-url>
cd taskflow
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start services with Docker Compose
```bash
docker-compose up -d
```

4. Install frontend dependencies
```bash
cd frontend/taskflow-ui
npm install
npm run dev
```

5. Access the application:
   - Frontend: http://localhost:3000
   - User Service: http://localhost:3001
   - Task Service: http://localhost:3002
   - Analytics Service: http://localhost:3003
   - Notification Service: http://localhost:3004

## 🚢 Deployment

**Current Status:** ✅ Complete
- [x] EKS cluster setup
- [x] Kubernetes manifests
- [x] Service deployments
- [x] Database configuration
- [x] Load balancer setup

### AWS EKS Deployment

1. Deploy infrastructure
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

2. Configure kubectl
```bash
aws eks update-kubeconfig --region us-west-2 --name taskflow-cluster
```

3. Deploy services
```bash
./scripts/deploy-all.sh
```

## 🔧 API Documentation

### User Service (/api/auth, /api/users)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### Task Service (/api/tasks)
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/category/:category` - Get tasks by category

### Analytics Service (/api/analytics)
- `GET /api/analytics/overview` - Task statistics
- `GET /api/analytics/productivity` - Productivity metrics
- `GET /api/analytics/trends` - Completion trends

### Notification Service (/api/notifications)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/preferences` - Update preferences
- `PUT /api/notifications/:id/read` - Mark as read

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `tasks` - Task data with metadata
- `task_categories` - Custom user categories
- `notifications` - Alert and reminder system
- `notification_preferences` - User notification settings

## 🔄 Planned Features & Roadmap

### Phase 1: Core Features ✅ (Complete)
- [x] User authentication system
- [x] Task CRUD operations
- [x] Category management
- [x] Basic analytics
- [x] Notification system
- [x] EKS deployment

### Phase 2: DevOps & Monitoring (In Progress)
- [ ] GitHub Actions CI/CD pipeline
- [ ] ArgoCD GitOps setup
- [ ] Prometheus metrics collection
- [ ] Grafana monitoring dashboards
- [ ] Automated testing pipeline

### Phase 3: Advanced Features (Planned)
- [ ] Enhanced security measures

## 🧪 Testing

```bash
# Run unit tests for all services
./scripts/test-all.sh

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📈 Monitoring & Observability

### Metrics Collection (Planned)
- API response times and error rates
- Task completion rates and trends
- User activity and engagement
- System resource utilization

### Health Checks
All services include health check endpoints:
- `GET /health` - Service health status
- `GET /metrics` - Prometheus metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow RESTful API conventions
- Write comprehensive tests
- Use consistent coding standards
- Update documentation for new features

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (planned)
- SQL injection prevention

## 📱 Frontend Features

### Components Architecture
- Common Components - Reusable UI elements
- Feature Modules - Auth, Tasks, Analytics, Notifications
- Custom Hooks - Shared logic and state management
- Context Providers - Global state management

### Key Features
- Responsive design for all devices
- Real-time task updates
- Drag-and-drop task management
- Interactive analytics charts
- Toast notifications
- Modal-based forms

## 🌐 Environment Configuration

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Service Ports
USER_SERVICE_PORT=3001
TASK_SERVICE_PORT=3002
ANALYTICS_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
```

## 📞 Support & Contact

For questions, issues, or contributions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review API endpoints and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ using modern microservices architecture