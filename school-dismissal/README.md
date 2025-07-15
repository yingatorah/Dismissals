# School Dismissal Management System

A comprehensive web application for managing school carline pickup operations. This system facilitates safe and efficient student dismissal through a structured queue management system.

## Features

### 🚗 **Carline Pickup Management**
- Manual parent queue entry by dismisser staff
- Real-time queue position tracking
- Student authorization verification
- Efficient dismissal workflow

### 👥 **Four User Types**

#### **Dismisser (Staff)**
- Manually log parents into pickup queue
- Verify parent identity and student authorization
- View and manage current queue
- Process student dismissals

#### **Teacher**
- View students assigned to their class
- Receive notifications when parents arrive
- Mark students as "ready" for pickup
- Track student pickup status

#### **Admin**
- View comprehensive dismissal activity logs
- Filter logs by date and status
- Track dismissal metrics and timing
- Audit trail for all pickup events

#### **Parent**
- View pickup process information
- Access contact information
- Understand carline procedures

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Backend**: Next.js API Routes

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd school-dismissal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   echo "DATABASE_URL=\"file:./dev.db\"" > .env
   echo "JWT_SECRET=\"your-secret-key-here\"" >> .env
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed with test data
   npx tsx src/lib/seed.ts
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Accounts

The seeding script creates the following test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@school.edu | admin123 |
| **Dismisser** | dismisser1@school.edu | dismisser123 |
| **Teacher** | teacher1@school.edu | teacher123 |
| **Teacher** | teacher2@school.edu | teacher123 |
| **Teacher** | teacher3@school.edu | teacher123 |
| **Parent** | parent1@email.com | parent123 |
| **Parent** | parent2@email.com | parent123 |
| **Parent** | parent3@email.com | parent123 |
| **Parent** | parent4@email.com | parent123 |

## Workflow Demo

### 1. **Dismisser Workflow**
- Login as dismisser: `dismisser1@school.edu / dismisser123`
- View available parents and their authorized students
- Add a parent to the pickup queue
- View queue position and student status
- Dismiss students when they're marked as ready

### 2. **Teacher Workflow**  
- Login as teacher: `teacher1@school.edu / teacher123`
- View your assigned students
- See pending pickup notifications
- Mark students as "ready" for pickup when parents arrive

### 3. **Admin Workflow**
- Login as admin: `admin@school.edu / admin123`
- View comprehensive dismissal logs
- Filter by date ranges and status
- Track timing and efficiency metrics

## Data Models

### Core Entities
- **Users**: Authentication and role management
- **Students**: Student information and status
- **Parents**: Parent profiles and authorized students
- **Teachers**: Teacher profiles and assigned students
- **Dismissers**: Staff managing the pickup queue

### Process Tracking
- **CarlineQueueEntry**: Queue position and timing
- **StudentPickupEvent**: Complete pickup lifecycle tracking
- **Student_Parent**: Authorization relationships

## Key Features Implemented

### 🔐 **Security & Authorization**
- Role-based access control
- JWT authentication
- Parent-student authorization verification
- Audit logging for all dismissal events

### 📊 **Queue Management**
- Position-based queue ordering
- Real-time status updates
- Multi-student pickup support
- Automatic queue progression

### 📈 **Reporting & Analytics**
- Complete dismissal event logging
- Timing and duration tracking
- Filterable activity logs
- Performance metrics

### 🎨 **User Experience**
- Responsive design for all devices
- Real-time data updates
- Intuitive role-specific dashboards
- Clear status indicators

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Dismisser
- `GET /api/dismisser/queue` - Get current queue
- `POST /api/dismisser/queue` - Add parent to queue
- `GET /api/dismisser/parents` - Get all parents and students
- `POST /api/dismisser/dismiss` - Dismiss a student

### Teacher
- `GET /api/teacher/students` - Get teacher's students
- `POST /api/teacher/mark-ready` - Mark student ready for pickup

### Admin
- `GET /api/admin/logs` - Get dismissal activity logs (with pagination and filtering)

## Database Schema

The application uses a comprehensive database schema with proper relationships:
- Users with role-based profiles
- Many-to-many student-parent authorizations
- Queue entries with position tracking
- Complete event logging with timestamps

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio          # Open database browser
npx prisma migrate dev      # Create/apply migrations
npx prisma generate         # Generate Prisma client
npx tsx src/lib/seed.ts    # Reseed database

# Reset database (if needed)
npx prisma migrate reset    # Reset and reseed database
```

## Architecture Notes

### Backend Logic Priority
The application prioritizes robust backend logic for queue management, authorization, and event logging before focusing on UI polish. This ensures data integrity and proper workflow enforcement.

### Manual Queue Entry
Parents are manually logged into the queue by dismisser staff for security reasons, ensuring proper identity verification and maintaining controlled access to students.

### Event Logging
Every pickup event is logged with timestamps for auditing purposes, providing a complete timeline from queue entry to student dismissal.

## Future Enhancements

- Real-time WebSocket updates for live queue status
- Mobile app for parents with push notifications
- Integration with school information systems
- Advanced analytics and reporting dashboard
- Automated parent notification system
- Support for multiple pickup methods (walking, bus, carline)

## Contributing

This is a demo application showcasing a complete school dismissal management system. The focus is on demonstrating proper data modeling, secure authentication, role-based access control, and comprehensive workflow management.
