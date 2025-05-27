
# NoteLink

**NoteLink** is a full-stack note management application built using React for the front end and Express, MongoDB, and Mongoose for the back end. It provides users with secure registration and authentication, allowing them to manage and organize personal notes easily.

## Features
- User authentication with JWT for secure access
- CRUD functionality for managing notes
- Pagination for efficient note browsing
- Light and dark theme toggles
- Persistent logging with date-time stamps for error tracking

## Tech Stack
- **Frontend:** React, Axios, TypeScript, Tailwind CSS
- **Backend:** Express.js, MongoDB, Mongoose, bcrypt, JWT, date-fns
- **Middleware:** morgan (for request logging)

## Getting Started

### Prerequisites
- Node.js (>=14.x)
- MongoDB Atlas account or local MongoDB instance

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```plaintext
PORT=3001
SECRET=your_jwt_secret
MONGODB_CONNECTION_URL=your_mongodb_connection_url
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/talcohen98/NoteLink.git
   cd NoteLink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the MongoDB server if you're using a local instance.

### Running the Application

To start the server, run:
```bash
npm start
```
The server will run on `http://localhost:3001`.

## Frontend Configuration

Ensure your frontend is set up to interact with the server on the same port (3001). Update axios requests in your React components to point to the backend URL (`http://localhost:3001`).

## API Endpoints
- **User Registration:** `POST /users`
- **Login:** `POST /login`
- **Get All Notes:** `GET /notes`
- **Get Note by ID:** `GET /notes/:id`
- **Create Note:** `POST /notes` (requires token)
- **Update Note:** `PUT /notes/:id` (requires token)
- **Delete Note:** `DELETE /notes/:id` (requires token)

## Note Schema

Each note includes:
- `id`: Unique identifier
- `title`: Optional title of the note
- `content`: Main content of the note
- `author`: Information about the author (name, email)
- `createdAt` and `updatedAt`: Date-time fields for tracking creation and updates

## Logging

All HTTP requests are logged in `log.txt` for easy tracking and debugging.

