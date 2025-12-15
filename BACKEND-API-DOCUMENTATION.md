# Backend API Documentation

This document describes the HTTP APIs used by the backend service. All endpoints are secured using JWT-based authentication and follow RESTful conventions.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Common Response Formats](#common-response-formats)
5. [API Endpoints](#api-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Committee Endpoints](#committee-endpoints)
   - [Motion Endpoints](#motion-endpoints)
   - [Debate Endpoints](#debate-endpoints)
   - [Vote Endpoints](#vote-endpoints)
   - [Membership Endpoints](#membership-endpoints)
6. [Error Handling](#error-handling)
7. [Role-Based Access Control](#role-based-access-control)

---

## Overview

This API provides a complete backend service for a parliamentary-style committee decision-making system based on Robert's Rules of Order. The system manages users, committees, motions, debates, and votes with role-based permissions.

## Authentication

All API endpoints require authentication using JWT (JSON Web Tokens) issued by Auth0.

### Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Validation

- **Issuer**: Auth0 domain (`https://${AUTH0_DOMAIN}/`)
- **Audience**: Auth0 API identifier
- **Verification**: JWKs (JSON Web Key Set) from Auth0

### User Identification

The authenticated user is identified by the `sub` (subject) field in the JWT payload, which corresponds to the Auth0 user ID.

## Base URL

```
/.netlify/functions/
```

All endpoints are deployed as Netlify serverless functions.

## Common Response Formats

### Success Response

```json
{
  "_id": "ObjectId or String",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp"
}
```

**Notes**:

- `_id` is ObjectId for most collections, but String (Auth0 ID) for Users
- Timestamps are automatically managed by Mongoose `timestamps: true` option
- `updatedAt` field is automatically updated on document modifications

### Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate username)
- `500 Internal Server Error` - Server error

---

## API Endpoints

## User Endpoints

### Get Current User

Retrieves the authenticated user's profile.

**Endpoint**: `GET /users/me`

**Authentication**: Required

**Response** (200):

```json
{
  "_id": "auth0|123456",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "pronouns": "he/him",
  "about": "Software developer",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

---

### Create or Update Current User

Creates a new user or updates the authenticated user's profile.

**Endpoint**: `POST /users/me`

**Authentication**: Required

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "pronouns": "he/him",
  "about": "Software developer"
}
```

**Notes**:

- If user exists, performs update operation
- If user doesn't exist, creates new user
- `auth0Id` is automatically extracted from JWT token
- All string fields are normalized (trimmed, null if empty)

**Response** (200):

```json
{
  "_id": "auth0|123456",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "pronouns": "he/him",
  "about": "Software developer",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Missing required fields or invalid data
- `409 Conflict` - Username already exists

---

### Get User by Username

Retrieves a user's public profile by username.

**Endpoint**: `GET /users/:username`

**Authentication**: Required

**URL Parameters**:

- `username` (string) - The username to look up

**Response** (200):

```json
{
  "_id": "auth0|123456",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "pronouns": "he/him",
  "about": "Software developer"
}
```

**Error Responses**:

- `400 Bad Request` - Username not provided
- `404 Not Found` - User not found

---
### Get Username by ID
retrieve the username of user (based on ID, the unique identifier for user entries)

**EndPoint**: GET: /users/id/:id
**Authentication** Not required
**Response**
'''JSON {"username": "johndoe"}'''
**Error Response**
- '400 Bad Request' - id required
- '404 Not Found' - User not found

## Committee Endpoints

### List All Committees

Retrieves all committees that the authenticated user is a member of.

**Endpoint**: `GET /committees`

**Authentication**: Required

**Response** (200):

```json
[
  {
    "_id": "65abc123def456789",
    "name": "Technology Committee",
    "description": "Oversees technology initiatives",
    "votingThreshold": "MAJORITY",
    "anonymousVoting": false,
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-10T09:00:00Z",
    "membersCount": 5,
    "motionsCount": 3
  }
]
```

**Notes**:

- Returns committees where user has an active membership
- Includes aggregated counts for members and motions
- Returns empty array if user has no memberships
- `votingThreshold`: "MAJORITY" (>50%) or "SUPERMAJORITY" (≥67%)
- `anonymousVoting`: When true, vote details are not publicly visible

---

### Create Committee

Creates a new committee with the authenticated user as the owner.

**Endpoint**: `POST /committees`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Technology Committee",
  "description": "Oversees technology initiatives",
  "votingThreshold": "MAJORITY",
  "anonymousVoting": false
}
```

**Required Fields**:

- `name` (string) - Committee name

**Optional Fields**:

- `description` (string) - Committee description
- `votingThreshold` (string) - "MAJORITY" or "SUPERMAJORITY" (default: "MAJORITY")
- `anonymousVoting` (boolean) - Whether votes are anonymous (default: false)

**Response** (200):

```json
{
  "_id": "65abc123def456789",
  "name": "Technology Committee",
  "description": "Oversees technology initiatives",
  "votingThreshold": "MAJORITY",
  "anonymousVoting": false,
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

**Notes**:

- Automatically creates a membership record with `OWNER` role for the creator

**Error Responses**:

- `400 Bad Request` - Missing name

---

### Get Committee by ID

Retrieves detailed information about a specific committee.

**Endpoint**: `GET /committees/:id`

**Authentication**: Required

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Response** (200):

```json
{
  "_id": "65abc123def456789",
  "name": "Technology Committee",
  "description": "Oversees technology initiatives",
  "votingThreshold": "MAJORITY",
  "anonymousVoting": false,
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Invalid committee ID format
- `404 Not Found` - Committee not found

---

### Update Committee

Updates committee information.

**Endpoint**: `PATCH /committees/:id`

**Authentication**: Required (OWNER role only)

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Request Body**:

```json
{
  "name": "Updated Committee Name",
  "description": "Updated description",
  "votingThreshold": "SUPERMAJORITY",
  "anonymousVoting": true
}
```

**Updateable Fields**:

- `name` (string) - Committee name
- `description` (string) - Committee description
- `votingThreshold` (string) - "MAJORITY" or "SUPERMAJORITY"
- `anonymousVoting` (boolean) - Whether votes are anonymous

**Response** (200):

```json
{
  "_id": "65abc123def456789",
  "name": "Updated Committee Name",
  "description": "Updated description",
  "votingThreshold": "SUPERMAJORITY",
  "anonymousVoting": true,
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Invalid data or nothing to update
- `403 Forbidden` - User does not have OWNER role
- `404 Not Found` - Committee not found

---

## Membership Endpoints

### Get Committee Members

Retrieves all members of a committee.

**Endpoint**: `GET /committees/:id/member`

**Authentication**: Required

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Response** (200):

```json
[
  {
    "_id": "65def789abc123456",
    "committeeId": "65abc123def456789",
    "userId": {
      "_id": "auth0|123456",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "role": "OWNER",
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-10T09:00:00Z"
  }
]
```

**Notes**:

- User information is populated from the User collection

**Error Responses**:

- `400 Bad Request` - Invalid committee ID
- `404 Not Found` - Committee not found

---

### Add Committee Member

Adds one or more members to a committee.

**Endpoint**: `POST /committees/:id/member`

**Authentication**: Required (OWNER role only)

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Request Body** (Single member):

```json
{
  "userId": "auth0|789012",
  "role": "MEMBER"
}
```

**Request Body** (Multiple members):

```json
[
  {
    "userId": "auth0|789012",
    "role": "MEMBER"
  },
  {
    "userId": "auth0|345678",
    "role": "CHAIR"
  }
]
```

**Required Fields**:

- `userId` (string) - Auth0 user ID

**Optional Fields**:

- `role` (string) - Member role (default: "MEMBER")

**Valid Roles**:

- `MEMBER` - Regular committee member
- `CHAIR` - Committee chair
- `OWNER` - Committee owner

**Response** (200):

```json
[
  {
    "_id": "65ghi012jkl345678",
    "committeeId": "65abc123def456789",
    "userId": "auth0|789012",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

**Notes**:

- Prevents duplicate memberships (returns existing membership if already exists)
- Can add multiple members in a single request

**Error Responses**:

- `400 Bad Request` - Invalid data
- `403 Forbidden` - User does not have OWNER role

---

### Remove Committee Member

Removes a member from a committee.

**Endpoint**: `DELETE /committees/:id/member`

**Authentication**: Required (OWNER role only)

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Request Body**:

```json
{
  "userId": "auth0|789012"
}
```

**Required Fields**:

- `userId` (string) - Auth0 user ID to remove

**Response** (200):

```json
{
  "deletedCount": 1
}
```

**Error Responses**:

- `400 Bad Request` - Missing userId or invalid committee ID
- `403 Forbidden` - User does not have OWNER role

---

### Change Member Role

Changes a committee member's role.

**Endpoint**: `PATCH /committees/:id/member`

**Authentication**: Required (OWNER role only)

**URL Parameters**:

- `id` (ObjectId) - Committee ID

**Request Body**:

```json
{
  "userId": "auth0|789012",
  "role": "CHAIR"
}
```

**Required Fields**:

- `userId` (string) - Auth0 user ID
- `role` (string) - New role (MEMBER, CHAIR, or OWNER)

**Response** (200):

```json
{
  "_id": "65ghi012jkl345678",
  "committeeId": "65abc123def456789",
  "userId": "auth0|789012",
  "role": "CHAIR",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Missing required fields
- `403 Forbidden` - User does not have OWNER role
- `404 Not Found` - Membership not found

---

## Motion Endpoints

### List Committee Motions

Retrieves all motions for a specific committee.

**Endpoint**: `GET /committees/:committeeId/motions`

**Authentication**: Required

**URL Parameters**:

- `committeeId` (ObjectId) - Committee ID

**Response** (200):

```json
[
  {
    "_id": "65mno456pqr789012",
    "committeeId": "65abc123def456789",
    "authorId": "auth0|123456",
    "title": "Approve new budget",
    "description": "Motion to approve the 2024 budget",
    "status": "VOTING",
    "originalMotionId": null,
    "createdAt": "2024-01-12T14:00:00Z",
    "updatedAt": "2024-01-12T15:30:00Z"
  }
]
```

**Notes**:

- Motions are sorted by creation date (newest first)
- `originalMotionId` will be set if this is an amended version of another motion

**Error Responses**:

- `400 Bad Request` - Invalid committee ID

---

### Create Motion

Creates a new motion in a committee.

**Endpoint**: `POST /committees/:committeeId/motions`

**Authentication**: Required (MEMBER or OWNER role)

**URL Parameters**:

- `committeeId` (ObjectId) - Committee ID

**Request Body**:

```json
{
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget with increased allocation for infrastructure"
}
```

**Required Fields**:

- `title` (string) - Motion title
- `description` (string) - Detailed motion description

**Response** (200):

```json
{
  "_id": "65mno456pqr789012",
  "committeeId": "65abc123def456789",
  "authorId": "auth0|123456",
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget with increased allocation for infrastructure",
  "status": "PROPOSED",
  "originalMotionId": null,
  "createdAt": "2024-01-12T14:00:00Z",
  "updatedAt": "2024-01-12T14:00:00Z"
}
```

**Notes**:

- New motions start with status `PROPOSED`
- Author ID is automatically set from authenticated user
- `originalMotionId` is null for new motions

**Error Responses**:

- `400 Bad Request` - Missing required fields or invalid committee ID
- `403 Forbidden` - User lacks required role
- `404 Not Found` - Committee not found

---

### Get Motion Details

Retrieves detailed information about a specific motion.

**Endpoint**: `GET /motions/:id`

**Authentication**: Required

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Response** (200):

```json
{
  "_id": "65mno456pqr789012",
  "committeeId": "65abc123def456789",
  "authorId": "auth0|123456",
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget",
  "status": "VOTING",
  "originalMotionId": null,
  "createdAt": "2024-01-12T14:00:00Z",
  "updatedAt": "2024-01-12T15:30:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Invalid motion ID
- `404 Not Found` - Motion not found

---

### Second a Motion

Allows a member to second a motion.

**Endpoint**: `POST /motions/:id/second`

**Authentication**: Required (any authenticated user except the motion author)

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Request Body**: Empty or `{}`

**Response** (200):

```json
{
  "_id": "65mno456pqr789012",
  "committeeId": "65abc123def456789",
  "authorId": "auth0|123456",
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget",
  "status": "SECONDED",
  "originalMotionId": null,
  "createdAt": "2024-01-12T14:00:00Z",
  "updatedAt": "2024-01-12T14:05:00Z"
}
```

**Notes**:

- Changes motion status from `PROPOSED` to `SECONDED`
- Motion author cannot second their own motion

**Error Responses**:

- `403 Forbidden` - Author attempting to second own motion
- `404 Not Found` - Motion not found

---

### Approve or Veto Motion (Chair Only)

Allows the committee chair to approve or veto a seconded motion.

**Endpoint**: `POST /motions/:id/chair/approve`

**Authentication**: Required (CHAIR role only)

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Request Body**:

```json
{
  "action": "APPROVE"
}
```

**Valid Actions**:

- `APPROVE` - Moves motion to `DEBATE` status
- `VETO` - Moves motion to `VETOED` status

**Response** (200):

```json
{
  "_id": "65mno456pqr789012",
  "committeeId": "65abc123def456789",
  "authorId": "auth0|123456",
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget",
  "status": "DEBATE",
  "originalMotionId": null,
  "createdAt": "2024-01-12T14:00:00Z",
  "updatedAt": "2024-01-12T14:10:00Z"
}
```

**Error Responses**:

- `400 Bad Request` - Invalid action
- `403 Forbidden` - User does not have CHAIR role or invalid motion status
- `404 Not Found` - Motion not found

---

### Open Voting (Chair Only)

Opens the voting phase for a motion under debate.

**Endpoint**: `POST /motions/:id/chair/open-vote`

**Authentication**: Required (CHAIR role only)

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Request Body**: Empty or `{}`

**Response** (200):

```json
{
  "_id": "65mno456pqr789012",
  "committeeId": "65abc123def456789",
  "authorId": "auth0|123456",
  "title": "Approve new budget",
  "description": "Motion to approve the 2024 budget",
  "status": "VOTING",
  "originalMotionId": null,
  "createdAt": "2024-01-12T14:00:00Z",
  "updatedAt": "2024-01-12T15:00:00Z"
}
```

**Notes**:

- Changes motion status from `DEBATE` to `VOTING`

**Error Responses**:

- `403 Forbidden` - User does not have CHAIR role or invalid motion status
- `404 Not Found` - Motion not found

---

## Debate Endpoints

### Create Debate Entry

Adds a debate comment to a motion.

**Endpoint**: `POST /motions/:id/debate`

**Authentication**: Required (MEMBER or OWNER role in the motion's committee)

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Request Body**:

```json
{
  "position": "SUPPORT",
  "content": "I support this motion because it addresses our budget needs"
}
```

**Required Fields**:

- `position` (string) - Debate position: `SUPPORT`, `OPPOSE`, or `NEUTRAL`
- `content` (string) - Debate comment text

**Response** (200):

```json
{
  "_id": "65stu789vwx012345",
  "motionId": "65mno456pqr789012",
  "authorId": "auth0|789012",
  "position": "SUPPORT",
  "content": "I support this motion because it addresses our budget needs",
  "createdAt": "2024-01-12T14:20:00Z",
  "updatedAt": "2024-01-12T14:20:00Z"
}
```

**Notes**:

- Motion must be in `DEBATE` status
- Requires committee membership

**Error Responses**:

- `400 Bad Request` - Missing required fields or invalid position
- `403 Forbidden` - User lacks required role or motion not in DEBATE status
- `404 Not Found` - Motion not found

---

### List Debate Entries

Retrieves all debate entries for a motion.

**Endpoint**: `GET /motions/:id/debate`

**Authentication**: Required

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Response** (200):

```json
[
  {
    "_id": "65stu789vwx012345",
    "motionId": "65mno456pqr789012",
    "authorId": "auth0|789012",
    "position": "SUPPORT",
    "content": "I support this motion because it addresses our budget needs",
    "createdAt": "2024-01-12T14:20:00Z",
    "updatedAt": "2024-01-12T14:20:00Z"
  },
  {
    "_id": "65stu890wxy123456",
    "motionId": "65mno456pqr789012",
    "authorId": "auth0|345678",
    "position": "OPPOSE",
    "content": "I have concerns about the budget allocation",
    "createdAt": "2024-01-12T14:25:00Z",
    "updatedAt": "2024-01-12T14:25:00Z"
  }
]
```

**Notes**:

- Sorted by creation date (newest first)

**Error Responses**:

- `400 Bad Request` - Invalid motion ID

---

## Vote Endpoints

### Cast Vote

Casts a vote on a motion.

**Endpoint**: `POST /motions/:id/vote`

**Authentication**: Required (MEMBER or OWNER role in the motion's committee)

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Request Body**:

```json
{
  "position": "SUPPORT"
}
```

**Required Fields**:

- `position` (string) - Vote position: `SUPPORT` or `OPPOSE`

**Response** (200):

```json
{
  "_id": "65xyz123abc456789",
  "motionId": "65mno456pqr789012",
  "authorId": "auth0|789012",
  "position": "SUPPORT",
  "createdAt": "2024-01-12T15:10:00Z",
  "updatedAt": "2024-01-12T15:10:00Z"
}
```

**Response with Motion Resolution** (200):

```json
{
  "vote": {
    "_id": "65xyz123abc456789",
    "motionId": "65mno456pqr789012",
    "authorId": "auth0|789012",
    "position": "SUPPORT",
    "createdAt": "2024-01-12T15:10:00Z",
    "updatedAt": "2024-01-12T15:10:00Z"
  },
  "motion": {
    "_id": "65mno456pqr789012",
    "status": "PASSED",
    ...
  }
}
```

**Notes**:

- Motion must be in `VOTING` status
- Each user can only vote once per motion (subsequent requests return existing vote)
- Automatically tallies votes after each submission
- Voting thresholds depend on committee settings:
  - **MAJORITY**: More than 50% support required
  - **SUPERMAJORITY**: 2/3 threshold calculated as `Math.ceil((memberCount * 2) / 3)`
- When threshold is reached, motion status changes to `PASSED` or `REJECTED`

**Error Responses**:

- `400 Bad Request` - Missing position or invalid value
- `403 Forbidden` - User lacks required role or motion not in VOTING status
- `404 Not Found` - Motion not found

---

### List Votes

Retrieves all votes for a motion.

**Endpoint**: `GET /motions/:id/vote`

**Authentication**: Required

**URL Parameters**:

- `id` (ObjectId) - Motion ID

**Response** (200):

```json
[
  {
    "_id": "65xyz123abc456789",
    "motionId": "65mno456pqr789012",
    "authorId": "auth0|789012",
    "position": "SUPPORT",
    "createdAt": "2024-01-12T15:10:00Z",
    "updatedAt": "2024-01-12T15:10:00Z"
  },
  {
    "_id": "65xyz234bcd567890",
    "motionId": "65mno456pqr789012",
    "authorId": "auth0|345678",
    "position": "OPPOSE",
    "createdAt": "2024-01-12T15:12:00Z",
    "updatedAt": "2024-01-12T15:12:00Z"
  }
]
```

**Notes**:

- Sorted by creation date (newest first)
- If committee has `anonymousVoting: true`, only aggregate vote counts may be visible

**Error Responses**:

- `400 Bad Request` - Invalid motion ID

---

## Error Handling

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Error Scenarios

#### Authentication Errors (401)

```json
{
  "error": "Missing authorization header"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

#### Permission Errors (403)

```json
{
  "error": "author cannot second their own motion"
}
```

```json
{
  "error": "motion status is not DEBATE"
}
```

#### Validation Errors (400)

```json
{
  "error": "title required"
}
```

```json
{
  "error": "Invalid committeeId"
}
```

#### Not Found Errors (404)

```json
{
  "error": "Motion not found"
}
```

#### Conflict Errors (409)

```json
{
  "error": "username already exists"
}
```

---

## Role-Based Access Control

### Committee Roles

The system implements three role levels within committees:

#### MEMBER

**Permissions**:

- Propose motions
- Second motions (if not the author)
- Participate in debates
- Vote on motions

#### CHAIR

**Permissions**:

- All MEMBER permissions
- Approve or veto seconded motions
- Open voting phase after debate

#### OWNER

**Permissions**:

- All MEMBER permissions
- Create committees
- Add/remove members
- Change member roles
- Update committee information

### Role Enforcement

The `authGuard` middleware enforces role-based access:

```javascript
// Example: Only OWNER can add members
const { user, error } = await authGuard(req, ["OWNER"], committeeId);
```

**Parameters**:

- `req` - HTTP request with JWT token
- `roles` (optional) - Array of allowed roles (if omitted, any authenticated user)
- `committeeId` (optional) - Committee to check membership against

### Motion Status Transitions

Motion status follows a strict lifecycle with role-based transitions:

```
PROPOSED → (any user seconds) → SECONDED
SECONDED → (CHAIR approves) → DEBATE
SECONDED → (CHAIR vetos) → VETOED
DEBATE → (CHAIR opens vote) → VOTING
VOTING → (threshold reached) → PASSED or REJECTED
```

**Voting Thresholds**: Determined by committee's `votingThreshold` setting (MAJORITY or SUPERMAJORITY)

---

## Motion Status Lifecycle

### Status Definitions

| Status     | Description                                           |
| ---------- | ----------------------------------------------------- |
| `PROPOSED` | Motion created, awaiting second                       |
| `SECONDED` | Motion seconded, awaiting chair approval              |
| `VETOED`   | Chair ruled motion out of order                       |
| `DEBATE`   | Motion open for discussion                            |
| `VOTING`   | Voting in progress                                    |
| `PASSED`   | Motion approved by committee's voting threshold       |
| `REJECTED` | Motion failed to achieve committee's voting threshold |

### Valid Transitions

From `PROPOSED`:

- → `SECONDED` (via `/motions/:id/second`)

From `SECONDED`:

- → `DEBATE` (via `/motions/:id/chair/approve` with `action: "APPROVE"`)
- → `VETOED` (via `/motions/:id/chair/approve` with `action: "VETO"`)

From `DEBATE`:

- → `VOTING` (via `/motions/:id/chair/open-vote`)

From `VOTING`:

- → `PASSED` (automatically when 2/3 votes support)
- → `REJECTED` (automatically when 2/3 votes oppose)

### Automatic Vote Tallying

When a vote is cast on a motion in `VOTING` status:

1. Count all `SUPPORT` votes
2. Count all `OPPOSE` votes
3. Get total committee membership count
4. Calculate threshold based on committee's `votingThreshold` setting:
   - **MAJORITY**: `Math.ceil(memberCount / 2)` (simple majority)
   - **SUPERMAJORITY**: `Math.ceil((memberCount * 2) / 3)` (two-thirds majority)
5. If support votes ≥ threshold: set status to `PASSED`
6. If oppose votes ≥ threshold: set status to `REJECTED`
7. Otherwise: motion remains in `VOTING` status

**Note**: Currently, the implementation uses SUPERMAJORITY (2/3) threshold by default. Future updates may respect the committee's `votingThreshold` setting.

---

## Data Validation

### String Normalization

All string fields undergo normalization:

- Trimmed of leading/trailing whitespace
- Empty strings converted to `null`
- Maintains data consistency

### ID Validation

All ObjectId parameters are validated:

- Must be valid MongoDB ObjectId format
- Returns `400 Bad Request` if invalid

### Duplicate Prevention

- **Users**: Username uniqueness enforced (case-sensitive)
- **Memberships**: One membership per user per committee
- **Votes**: One vote per user per motion

---

## Additional Notes

### Database Connection

All serverless functions automatically connect to MongoDB before processing requests:

```javascript
export default async function (req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
```

### Population

Some endpoints populate related data:

- `/committees/:id/member` populates user details (username, email, firstName, lastName)

### Aggregations

- Committee lists include aggregated `membersCount` and `motionsCount`
- Vote tallying uses aggregation to determine motion outcomes

### Sorting

- Motions: Sorted by `createdAt` descending (newest first)
- Debates: Sorted by `createdAt` descending (newest first)
- Votes: Sorted by `createdAt` descending (newest first)

---

## API Versioning

Currently, the API has no version prefix. Future versions may introduce versioning in the URL path:

```
/.netlify/functions/v2/...
```

## Rate Limiting

Rate limiting is not currently implemented but should be considered for production deployments.

## CORS

CORS configuration is handled by Netlify. Ensure appropriate origins are configured in `netlify.toml`.

---

## Support and Contact

For issues or questions about the API, please refer to the project README or contact the development team.
