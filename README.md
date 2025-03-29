# Codeway Case Study

This repository contains a full-stack web application developed as a case study for Codeway. The application comprises a client-side built with Vue.js and a server-side implemented with Node.js.

## Project Structure

- `.vscode/`: Contains Visual Studio Code workspace settings.
- `client/`: Houses the Vue.js frontend application.
- `server/`: Contains the Node.js and Express backend application.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `codeway-env.postman_environment.json`: Postman environment configuration for API testing.
- `codeway.postman_collection.json`: Postman collection of API endpoints for testing.


## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js]
- [npm]
- [Vue + Vite]
- [Firebase]

### Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   npm install
1. Navigate to the `client` directory:
  ```bash
  cd client
  npm install
  ```

## How to use  
client and server modules are independent project so they can both be run by npm run dev under their respective folders, of course you will need .env variables. I provided them via email. 
Please visit https://codeway-case-frontend.onrender.com for a live version. 

Here you will also find postman collection and env json files. It will possible to test the backend via these, post-script of the signin request will put the idToken into your environment therefore it should be a smooth experience.


See how it works
test user credentials:  
cihan.nesvat10@gmail.com  
12345678

Note that this user has "default" country. Therefore, it will get the latest version of its parameters. Any other country will get the second-last version. 
You can also signup with an arbitrary email and test with your user.

## Features
- **User-friendly UI** built with Vue 3 and Composition API.
- **RESTful API** built using Node.js and Express.
- **Modular codebase**: Clean separation between frontend and backend. Best practice(?) backend structure with middlewares, services, controllers, etc. 
- **Postman support**: Easily test endpoints with the provided Postman collection and environment files.

## Some of the design choices:
- **optimistic loading:** I took an optimistic loading approach to improve the UX. Here in the case of an update, add or delete the UI is updated immediately while the backend is processing the HTTP request. If the request fails the UI is restored to its previous state.
- **never delete:** instead of deleting parameters I just flag them as deleted. I know, its some evil corporation mindset.
- **versions:** parameters are versioned instead of being updated.

## Some thoughts ?
- I would have loved to implement my own user authentication instead of using firebase.
- Contrary to what the case study says, I always authenticated my user's tokens instead of checking api keys. I would like to discuss the implications of this.
- Unfortunately I didn't have the time to implement email verification.
- I implemented signup and signout because I just thought they were needed for a full UX.
- Keep in mind users are redirected to signin page immediately in the case of expired jwts. I couldn't have the time to improve this experience.
- There's a friendly joke in the signup button
- About country: I implemented the country information as a manual input during user signup, I know this is not the best practice as this information should probably be extracted from the incoming request anyway but I didn't really have the time to implement this fully  
- As I previously stated in the initial email I won't be able utilize the 7-day time frame full because I literally need to catch my plane. Therefore, I guess I could have done a better job in general (backend optimization, etc) but it was a fun project to do nonetheless. So, thanks!   


## endpoints
GET http://localhost:3000/api/config  
POST http://localhost:3000/api/auth/signin  
POST http://localhost:3000/api/auth/signup  
POST http://localhost:3000/api/config  
UPDATE http://localhost:3000/api/config/test2  
DELETE http://localhost:3000/api/config/test2  

