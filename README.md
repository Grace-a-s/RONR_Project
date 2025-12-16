# Bob's Rules

A web application designed to facilitate asynchronous committee-based decision-making using Robert's Rules of Order. This platform enables committees to propose, debate, and vote on motions with proper parliamentary procedure, all in an asynchronous digital environment.

**Live Website**: [Insert website link]

**Demo**: [Insert demo video]

## Table of Contents

- [Overview](#overview)
  - [Key Features](#key-features)
  - [Motion Status Lifecycle](#motion-status-lifecycle)
  - [Role-Based Permissions](#role-based-permissions)
    - [Member](#member)
    - [Chair](#chair)
    - [Owner](#owner)
  - [Website Walkthrough](#website-walkthrough)
- [Technical Stack](#technical-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Deployment](#deployment)
- [Backend API Endpoints and Database Schema](#backend-api-endpoints-and-database-schema)
  - [Key API Features](#key-api-features)
  - [Core Collections](#core-collections)

## Overview

### Key Features

- **Committee Management**: Create and manage committees with customizable voting thresholds (majority or supermajority) and anonymous voting options
- **Motion Workflow**: Complete parliamentary procedure lifecycle from proposal through seconding, debate, and voting
- **Role-Based Permissions**: Three-tier role system (Member, Chair, Owner) with appropriate access controls
- **Real-Time Status Updates**: Automatic motion status transitions and vote tallying
- **User Authentication**: Secure authentication via Auth0 with JWT token-based API access
- **Asynchronous Collaboration**: Members can participate in debates and voting on their own schedule

### Motion Status Lifecycle

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

### Role-Based Permissions

#### Member

Members are the standard participants in the committee who can fully participate in the deliberative process. This is the default role for most committee participants.

- Propose new motions
- Second motions proposed by others
- Participate in debates and discussions
- Cast votes on open motions
- Challenge Chair vetoes
- View committee information and motion history

#### Chair

The Chair (or presiding officer) manages the governance and procedural aspects of the committee. This role ensures proper parliamentary procedure and controls the flow of business during meetings. A Chair, notably, is not a voting member: in order to preserve impartiality and avoid the appearance of bias, the Chair's role excludes them from proposing motions, casting votes, or participating in debates.

- Approve or veto seconded motions
- Open voting on motions
- Manage voting threshold settings (majority vs. supermajority)
- Control anonymous voting settings
- Second another user's motion

#### Owner

The Owner has the ability to manage the roles of other users within the committee. This role is automatically assigned to the person who created the committee. Multiple users can share the Owner role.

**Permissions**

- Add and remove members
- Change member roles (assign/remove CHAIR/OWNER status)
- All MEMBER permissions

### Website Walkthrough

When the website is opened for the first time by a user they will be asked to log in/sign up. A real email is not required. Password strength requirements pop up for the user to reference. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115044" src="https://github.com/user-attachments/assets/65a1cae1-fb05-42af-999f-9de1f8bf826b" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115208" src="https://github.com/user-attachments/assets/c6f9c4e0-84c8-4da0-bf73-6cba80d37cd4" />
Once the user has been authenticated they are brought to the landing page
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115304" src="https://github.com/user-attachments/assets/7771cd89-fb10-4eaf-8d95-54e81228cc77" />
The username will be the beginning of their email until they change it on their profile (Shown later). The user can begin creating committees. By creating a committee they become the Owner. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115341" src="https://github.com/user-attachments/assets/5874b576-cee7-48b7-94eb-ef5ebb82ea0e" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115559" src="https://github.com/user-attachments/assets/a2ef6c55-241f-450c-a88e-965d79213545" />
The user can then click in to a committee. If the user has been added as a Member to another committee by others it will show here as well. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115626" src="https://github.com/user-attachments/assets/6a022c49-eb0c-4b14-99f3-629353398ca6" />
Once in a committee the user can click Manage/View Membership. Sicne this user is the Owner they can then add members and change member roles by double clicking on the role entry. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115651" src="https://github.com/user-attachments/assets/752c1403-6e6e-438c-93bb-95a23eb1e58a" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115752" src="https://github.com/user-attachments/assets/d396ee81-918a-4939-904e-ef0fd8947df2" />



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

- [BACKEND-API-DOCUMENTATION.md](./BACKEND-API-DOCUMENTATION.md) - Complete API endpoint reference
- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - MongoDB collections, fields, relationships, and data types

### Key API Features

- JWT-based authentication on all endpoints
- Role-based access control (RBAC)
- Automatic vote tallying and motion resolution
- RESTful conventions with proper HTTP status codes

### Core Collections

1. **Users** - Auth0-synchronized user profiles with usernames and metadata
2. **Committees** - Decision-making bodies with configurable voting rules
3. **Memberships** - User-committee relationships with roles (Member, Chair, Owner)
4. **Motions** - Proposals with status tracking through parliamentary lifecycle
5. **Debates** - Discussion entries with positions (Support, Oppose, Neutral)
6. **Votes** - User votes with positions (Support, Oppose)
