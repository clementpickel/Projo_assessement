# PROJO 
# Software Engineer Internship Technical Assessment

## PART 1: CODE

You are tasked with developing a minimalist web application that integrates with an external service to generate an image.

### Objective

Create a **Minimal Viable Product (MVP) Text-to-Image Webapp** that allows a user to input a word and display the resulting generated image.

### Instructions

1.  **Implementation:** Build a minimalist web application featuring a text input form and a display area for the generated image.
2.  **API Integration:** Your application must use the provided external API via your backend acting as a proxy.
3.  **Delivery Requirements:**
    * Commit your work to a Git repository and share it.
    * Prepare a functional Docker configuration for deployment.

### External "Word-to-Image" API Details

Your Back-end must communicate with the following external service:

| Description | Details |
| :--- | :--- |
| **Endpoint URL** | `REDACTED` |
| **HTTP Request** | `GET /word-to-image` |
| **Authentication Header** | `x-api-key = "REDACTED"` |
| **Request Body** | JSON: `{"word": "your-value"}` |
| **Response Body** | Raw Image Data |

### Preferred Technology Stack

* **Frontend:** Vue.js
* **Backend:** ExpressJS

The use of **TypeScript** is encouraged. 
You are free to choose an alternative modern JavaScript framework if you are significantly more proficient with it.

---

## PART 2: SYSTEM DESIGN

**No code is required for this section.**

Now you have a working webapp, your success is on its way and your audience is growing.
The external API must add a **strict rate limit of 30 requests per minute** to handle your load.

### Instructions

Relying on your expertise, detail some architectural changes and components you would implement to enable the application to **scale** while guaranteeing the constraint is never violated.

Your response must propose solutions for:

1.  Handling high user request volume.
2.  Guaranteeing the external API rate limit is respected
3.  Ensuring a good user experience.

Don't hesite to draw diagrams.

**As a reminder, no code is required for this section.**
