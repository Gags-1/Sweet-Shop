# Sweet Shop Management System 

This project is a full-stack **Sweet Shop Management System**.  
It features a RESTful API backend with **FastAPI** and a single-page frontend application built using **React**.  

### Admin Credentials
- **Email:** magan@example.com  
- **Password:** string  

> **Note:** Login is required to access and use the application.

To view the application as a general user, simply **register as a new user** and enjoy exploring the sweets catalog and shopping features.

### Live Deployment
You can access the live application [here]
(https://sweet-shop-chi.vercel.app/)
---

## Project Details

The backend is built with **FastAPI**, a modern, fast (high-performance) web framework for building APIs with Python.  
The frontend is a modern single-page application (SPA) built using **React**.  

The application manages a list of sweets, allowing users to view, search, purchase, and (for administrators) manage inventory.

---

## Key Features ✨

- **RESTful Backend API:** Built with FastAPI, handling all data logic.  
- **User Authentication:** Users can register and log in, with secure token-based authentication (JWT) for protected endpoints.  
- **Sweets Management:** API endpoints for adding, viewing, searching, updating, and deleting sweets.  
- **Inventory Management:** Functionality to purchase sweets (decreasing quantity) and restock them (increasing quantity).  
- **Modern Frontend:** An interactive React SPA for a great user experience.  
- **Test-Driven Development (TDD):** The project was developed with a focus on writing tests before implementation to ensure high test coverage and a robust application.  

---

## Screenshots of the Application 🖼️

### Admin Dashboard
![Admin Dashboard](https://github.com/Gags-1/Sweet-Shop/blob/main/images/admin%20dashboard.png)

### Cart
![Cart](https://github.com/Gags-1/Sweet-Shop/blob/main/images/cart.png)

### New Sweet
![Add New Sweet](https://github.com/Gags-1/Sweet-Shop/blob/main/images/create%20new%20sweet.png)

### Homepage
![Homepage](https://github.com/Gags-1/Sweet-Shop/blob/main/images/homepage.png)

### Update Sweets
![Update Sweets](https://github.com/Gags-1/Sweet-Shop/blob/main/images/update%20sweets.png)

---

## How to Set Up and Run Locally 🚀

### Prerequisites
- Python 3.8+  
- Node.js and npm  
- A database (e.g., PostgreSQL, MongoDB, SQLite)  

### Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. Run the FastAPI application:
    ```bash
    uvicorn app.main:app --reload
    ```
4. The backend API will be available at [http://localhost:8000](http://localhost:8000).

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install the npm packages:
    ```bash
    npm install
    ```
3. Run the React application:
    ```bash
    npm run dev
    ```
4. The frontend application will be available at [http://localhost:5173](http://localhost:5173) (or a similar port).

---

## My AI Usage 🤖

This project was built with assistance from AI tools, which are an integral part of my modern development workflow.

### AI Tools Used
- **ChatGPT**

### How I Used Them
- **Backend Development:** Used ChatGPT to generate some unit tests and initial boilerplate code for API endpoints, allowing me to focus more on core business logic and validation rules.  
- **Frontend Development:** Used ChatGPT to create the frontend application using React, React Router v7, and shadcn UI. This included generating component structures and initial layouts.  

### Reflection
AI significantly accelerated my development process by automating repetitive and boilerplate tasks. However, I ensured that the code was not simply copied, but used as a starting point that I augmented with my own logic, validation, and design choices to maintain a unique, high-quality result.

---

## Test Report 🧪

A comprehensive test suite was run to ensure the quality and functionality of the backend API.  
You can view the full test report [here](https://github.com/Gags-1/Sweet-Shop/blob/main/test_report_v2.pdf).
