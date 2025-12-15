# Bob's Rules

A web application designed to facilitate asynchronous committee-based decision-making using Robert's Rules of Order. This platform enables committees to propose, debate, and vote on motions with proper parliamentary procedure, all in an asynchronous digital environment.

**Live Website**: [Insert website link]
**Demo**: [Insert demo video]

## Key Features

- **Committee Management**: Create and manage committees with customizable voting thresholds (majority or supermajority) and anonymous voting options
- **Motion Workflow**: Complete parliamentary procedure lifecycle from proposal through seconding, debate, and voting
- **Role-Based Permissions**: Three-tier role system (Member, Chair, Owner) with appropriate access controls
- **Real-Time Status Updates**: Automatic motion status transitions and vote tallying
- **User Authentication**: Secure authentication via Auth0 with JWT token-based API access
- **Asynchronous Collaboration**: Members can participate in debates and voting on their own schedule

### Website Walkthrough

[ Insert screenshots ]

## Technical Stack

### Frontend

- **React 19.2.0** with Vite for fast development and optimized builds
- **Material-UI (MUI) 7.3.5** for modern, responsive UI components
- **React Router DOM 7.9.4** for client-side routing
- **Auth0 React SDK 2.8.0** for authentication integration

### Backend

- **Netlify Serverless Functions** for scalable, event-driven API endpoints
- **MongoDB Atlas** with Mongoose 9.0.0 for document database storage
- **Auth0 Authentication** with JWT token validation
- **jose 6.1.2** for JWT verification and security

### Deployment

- **Netlify** for hosting and continuous deployment

## Backend API Endpoints and Database Schema

This project implements a complete RESTful API with MongoDB for persistent storage. The system models users, committees, memberships, motions, debates, and votes with proper relationships and role-based access control.

**Detailed Documentation**:

- [BACKEND-API-DOCUMENTATION.md](./BACKEND-API-DOCUMENTATION.md) - Complete API endpoint reference with request/response examples
- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - MongoDB collections, fields, relationships, and data types

### Core Collections

1. **Users** - Auth0-synchronized user profiles with usernames and metadata
2. **Committees** - Decision-making bodies with configurable voting rules
3. **Memberships** - User-committee relationships with roles (Member, Chair, Owner)
4. **Motions** - Proposals with status tracking through parliamentary lifecycle
5. **Debates** - Discussion entries with positions (Support, Oppose, Neutral)
6. **Votes** - User votes with automatic threshold tallying

### Key API Features

- JWT-based authentication on all endpoints
- Role-based access control (RBAC)
- Automatic vote tallying and motion resolution
- RESTful conventions with proper HTTP status codes
- Comprehensive error handling and validation

## Motion Status Lifecycle

Motions follow Robert's Rules of Order with these status transitions:

```
PROPOSED → SECONDED → DEBATE → VOTING → PASSED/REJECTED
              ↓
           VETOED
```

1. **PROPOSED**: Motion created, awaiting second
2. **SECONDED**: Motion seconded, awaiting chair approval
3. **VETOED**: Chair ruled motion out of order (terminal state)
4. **DEBATE**: Motion approved for discussion
5. **VOTING**: Voting phase opened by chair
6. **PASSED/REJECTED**: Determined by vote threshold

## Role-Based Permissions

### Member

- Propose motions
- Second motions (if not author)
- Participate in debates
- Vote on motions

### Chair

- All Member permissions
- Approve or veto seconded motions
- Open voting phase after debate

### Owner

- All Member permissions
- Create committees
- Add/remove members
- Change member roles
- Update committee settings
