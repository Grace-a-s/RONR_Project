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
The user can then click in to a committee. If the user has been added as a Member to another committee by others, it will show here as well.
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115559" src="https://github.com/user-attachments/assets/a2ef6c55-241f-450c-a88e-965d79213545" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115626" src="https://github.com/user-attachments/assets/6a022c49-eb0c-4b14-99f3-629353398ca6" />

Once in a committee, the user can click Manage/View Membership. Since this user is the Owner they can then add members by clicking the button and change member roles by double clicking on the role entry in the table. 

<img width="1920" height="1128" alt="Screenshot 2025-12-16 115651" src="https://github.com/user-attachments/assets/752c1403-6e6e-438c-93bb-95a23eb1e58a" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 115752" src="https://github.com/user-attachments/assets/d396ee81-918a-4939-904e-ef0fd8947df2" />

From the top navigation bar you can navigate to user profile and change the user information. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 120438" src="https://github.com/user-attachments/assets/39c0ef30-5324-48dc-a17e-904d2496f340" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 120514" src="https://github.com/user-attachments/assets/3fbec0fa-0f12-4a65-8ae8-11a7d63be971" />

From the committee page we can create motions and click on "view details" to go to the motion. 

<img width="1920" height="1128" alt="Screenshot 2025-12-16 122313" src="https://github.com/user-attachments/assets/1a4efd59-12d6-421f-8776-d7e54a1987b1" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 122334" src="https://github.com/user-attachments/assets/0d24f802-312f-4c1a-b2f8-5c8e4633a199" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 122612" src="https://github.com/user-attachments/assets/c6f4c107-ffcb-4468-a069-5a63abcf7bd1" />

Another user will then second the motion and will be prompted to wait for the chair before debate begins. Next, a chair must approve or deny(veto). If approved, debate begins.  

<br>Here is the chair's POV
<img width="1920" height="1128" alt="Screenshot 2025-12-16 122831" src="https://github.com/user-attachments/assets/78d9978f-755f-4a6c-95e3-5d1cbd2338ec" />

You can now debate, selecting your position and hitting send. Select view debate to see what has been said. 

<img width="1920" height="1128" alt="Screenshot 2025-12-16 123507" src="https://github.com/user-attachments/assets/10a84320-ed4b-477a-95e7-6118e0ae8c54" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 123523" src="https://github.com/user-attachments/assets/7b2d7b76-664c-40a3-a2e5-4e43b559725e" />

Once the chair determines a motion has been sufficiently debated they can then begin the vote <br>  

Chair POV: 
<img width="960" height="564" alt="Screenshot 2025-12-16 124356" src="https://github.com/user-attachments/assets/873cb1d3-eae9-45d9-9ce6-f514eaa0d4cb" />

From the committee page we can search motions by contents or by their status using the pink drop down menu. This allows users to quickly navigate to the motions that require their attention. We will look for motions we need to vote on. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 125421" src="https://github.com/user-attachments/assets/f7563f6f-8d61-46fc-8a58-393ef64e6e42" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 125433" src="https://github.com/user-attachments/assets/3393fd31-eb8f-4df0-a20e-732a69917a32" />

The voting button is now visible and the user can make their choice. 
<img width="960" height="564" alt="Screenshot 2025-12-16 125715" src="https://github.com/user-attachments/assets/3b4c58a2-567b-4a0f-90e5-61d7835856f0" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 125740" src="https://github.com/user-attachments/assets/81401bc3-392d-49e1-b515-7b56281ec007" />
The voting panel shows where the vote currently is and tells the user if they have voted and how. If the user returns to this page they will know they have voted. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 125800" src="https://github.com/user-attachments/assets/6a1b7ddf-ae86-4e52-ba80-afee26abdae3" />

If the preferred procedures are a 2/3 vote or anonymous voting the Chair can change the committee's voting settings on the manage/view membership page.
<img width="1920" height="1128" alt="Screenshot 2025-12-16 130151" src="https://github.com/user-attachments/assets/0b9cedaf-845a-41d5-8967-3eedd18bb563" />

After the threshold to pass is reached we can see that it has passed, if it is not passed it is marked as rejected. If enough oppose votes occur to make it impossible to pass it will be rejected. Ties are also rejected. (ex. 4 voting members, 2 support, 2 oppose) 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 131010" src="https://github.com/user-attachments/assets/c6a0b535-8fd2-45b5-81f2-955d1d96b85b" />
If a motion is rejected there will be an option to repropose for members who voted on the motion.
<img width="1920" height="1128" alt="Screenshot 2025-12-16 144144" src="https://github.com/user-attachments/assets/c686681b-61bb-42fb-b85a-246acfbc5155" />
The reproposed motion will be marked as such
<img width="1920" height="1128" alt="Screenshot 2025-12-16 144510" src="https://github.com/user-attachments/assets/58619988-978c-44c4-890f-b622e83cd4c7" />

If the chair decides to veto this (or any) motion the users can vote to override the chair with a supermajority. If the vote is successful the motion will move to debate. 
<img width="1920" height="1128" alt="Screenshot 2025-12-16 133016" src="https://github.com/user-attachments/assets/6c1a3516-34f1-400c-a003-09e783486676" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 133114" src="https://github.com/user-attachments/assets/1846d037-ac91-4681-a975-9b328b466245" />

User can also navigate to user roles to read more about what they can and cannot do.  

<img width="219" height="153" alt="Screenshot 2025-12-16 140413" src="https://github.com/user-attachments/assets/80e6e2a8-2856-43a4-b644-79083aceb3db" />
<img width="1920" height="1128" alt="Screenshot 2025-12-16 140259" src="https://github.com/user-attachments/assets/814ed81f-d1b5-435a-847c-c89b4004c5fd" />




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
