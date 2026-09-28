# CiviLanka

## Smart Civil Registration & Certificate Services Mobile Application

CiviLanka is a **mobile-based civil registration and certificate management application** designed for government-oriented civil registration services in Sri Lanka.

The application aims to make civil record management, certificate applications, resident information management, and record searching easier and more organized through a simple mobile interface.

> This is an academic project developed for educational purposes.

## Project Objectives

* Digitize civil registration-related processes.
* Reduce manual record management.
* Provide easy access to civil records.
* Support role-based access to information.
* Allow authorized users to create and update records.
* Provide a simple and user-friendly mobile interface.
* Improve the efficiency of certificate and record management.

## User Roles

The application supports the following government-related roles:

* Development Officer
* Village Officer
* Marriage Registrar
* District Registrar
* Bank Officer

Each role has access to functions based on its responsibilities and permissions.

## Main Features

### Birth Registration

* Create birth records
* View birth records
* Update birth information
* Manage birth-related details

### Death Registration

* Create death records
* View death records
* Update death information
* Manage death-related details

### Marriage Registration

* Create marriage records
* View marriage records
* Update marriage information
* Manage marriage-related information

### Resident / Personal Information

* Create resident information
* Search residents
* View resident details
* Update authorized personal information

### Civil Record Search

* Search civil records
* View authorized information
* Search using relevant identification details

### Certificate Management

* Apply for certificates
* Track application status
* View certificate information
* Download certificates where applicable

### Role-Based Access Control

Users can access features according to their assigned role and permissions.

### Notifications

Users can receive notifications related to applications, updates, and status changes.

## Project Structure

```text
CiviLanka/
│
├── mobile/
│   ├── assets/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── App.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── README.md
└── .gitignore
```

## Folder Description

### `mobile/`

Contains the CiviLanka mobile application.

It includes:

* Screens
* UI components
* Navigation
* API services
* Models
* Assets
* Utility functions

### `backend/`

Contains the server-side application.

It includes:

* REST APIs
* CRUD operations
* Authentication
* Authorization
* Business logic
* Database models
* API routes
* Middleware

## CRUD Operations

| Module                | Operations           |
| --------------------- | -------------------- |
| Birth Registration    | Create, Read, Update |
| Death Registration    | Create, Read, Update |
| Marriage Registration | Create, Read, Update |
| Resident Information  | Create, Read, Update |

For sensitive civil records, permanent deletion can be avoided by using authorized correction, deactivation, or archival processes.

## UI/UX

The mobile application is developed based on the high-fidelity UI/UX prototype created during the previous milestones.

The design focuses on:

* Simple navigation
* Clear information hierarchy
* Easy-to-understand interfaces
* Consistent layouts
* Role-based dashboards
* Clear buttons and labels
* User-friendly forms
* Accessibility

## Testing

### Functional Testing

The application will be tested for core functions such as:

* Registration
* Login
* Record creation
* Record viewing
* Record updating
* Record searching
* Certificate management

### CRUD Testing

Each implemented module will be tested to verify that the required CRUD operations work correctly.

### Usability Testing

Usability testing will be conducted with a minimum of **5 users** to identify usability issues and collect user feedback.

## Technology Stack

### Mobile Application

```text
Mobile Framework: To be added
Language: To be added
```

### Backend

```text
Backend Framework: To be added
Database: To be added
API: REST API
Authentication: To be added
```

The final technologies will be updated after the development team confirms the technology stack.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Project

```bash
cd CiviLanka
```

### 3. Run the Backend

```bash
cd backend
```

Install the required dependencies and start the backend server.

### 4. Run the Mobile Application

Open a new terminal:

```bash
cd mobile
```

Install the required dependencies and run the mobile application using the selected mobile framework.

Detailed setup instructions will be added after the final technology stack is confirmed.

## Academic Information

**Module:** IT3060 – Human Computer Interaction
**Academic Year:** 2026
**Institution:** SLIIT
**Project:** CiviLanka – Civil Registration & Certificate Services Mobile Application
**Group:** WD_78
**Project Type:** Academic Mobile Application

## Team

This project is developed by a team of **4 members**.

Each member is responsible for implementing assigned interfaces and CRUD functionality.

## Project Status

**In Development**

The project is currently being implemented as a working mobile application based on the previously developed UI/UX prototype.

## Future Improvements

* Digital certificate verification
* Government system integrations
* QR-based certificate verification
* Improved notification services
* Document verification
* Detailed audit logs
* Advanced search and filtering
* Secure digital certificate delivery

## License

This project is developed for **academic and educational purposes**.
