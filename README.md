# Focus Dashboard

A modern productivity web app to help you organize your tasks, manage your time, and stay focused—all in one place.

## Features

- **To-Do List**: Organize your tasks by Daily, Weekly, and Monthly tabs. Add, edit, mark as done, or delete tasks. Tasks are stored in a Supabase backend.
- **Pomodoro Timer**: Adjustable timer with start, pause, stop, and reset controls to help you focus on your work sessions.
- **YouTube Video Embed**: Load and watch a YouTube video directly in the dashboard for background music or study sessions.
- **Responsive UI**: Clean, modern interface built with HTML, CSS, and JavaScript.

## Planned Features

- [ ] **Automatic Category Reset:** Periodically clear or uncheck tasks in Daily, Weekly, and Monthly categories based on their frequency.
- [ ] **User Accounts & Sessions:** Add user authentication and session management to support multiple users before deployment.
- [ ] **Semantic HTML:** Refactor templates to use more semantic HTML elements for improved accessibility and SEO.
- [ ] **Customizability:** Allow users to personalize aspects such as background, UI layout, and other preferences per session or user.

## Suggestions for Improvement

- **CI/CD Pipeline:** Implement a CI/CD pipeline (e.g., using GitHub Actions) to automate testing and deployment.
- **Containerization:** Dockerize the application for easier setup and consistent development/production environments.
- **API Documentation:** Add API documentation (e.g., using Swagger/OpenAPI) if the backend is expanded.
- **State Management:** For the frontend, as it grows, consider a state management library or more robust patterns for managing application state.
- **Testing:** Add more comprehensive tests, including end-to-end tests (e.g., using Cypress or Selenium) to ensure all features work as expected.

## Getting Started

### Prerequisites
- Python 3.7+
- [pip](https://pip.pypa.io/en/stable/)
- A [Supabase](https://supabase.com/) project (for backend storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "Focus Dashboard"
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up environment variables:**
   Copy the example file and update it with your Supabase credentials:
   ```bash
   cp .env.example .env
   # Then edit .env to add your SUPABASE_URL and SUPABASE_KEY
   ```
4. **Set up Supabase table:**
   - Create a table named `tasks` with columns:
     - `id` (integer, primary key, auto-increment)
     - `task_name` (text)
     - `frequency` (text: 'daily', 'weekly', 'monthly')
     - `status` (boolean)
     - `created_at` (timestampz)
     - `modified_at` (timestampz)

### Running the App

```bash
python app.py
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

```
Focus Dashboard/
├── app.py                # Flask backend
├── requirements.txt      # Python dependencies
├── static/
│   ├── css/style.css     # Stylesheet
│   └── js/main.js        # Frontend logic
├── templates/
│   └── index.html        # Main HTML template
└── ...
```

## Technologies Used
- Python, Flask
- Supabase (PostgreSQL backend)
- HTML, CSS, JavaScript

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.