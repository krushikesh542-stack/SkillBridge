# SkillBridge

**A role-based platform connecting students, recruiters, and mentors through opportunities, professional networking, and guided learning.**

SkillBridge is a full-stack web application for early-career talent and the people helping them grow. Students can build a professional profile, discover opportunities, submit applications, connect with other members, and track learning resources. Startup/recruiter accounts can publish opportunities and manage applicants, while mentors can maintain expertise-focused profiles and participate in the shared network and learning experience.

## Live demo

- **Application:** [skillbridge-frontend-jkgi.onrender.com](https://skillbridge-frontend-jkgi.onrender.com)
- **Backend API:** [skillbridge-backend-d03p.onrender.com](https://skillbridge-backend-d03p.onrender.com)
- **Health check:** [skillbridge-backend-d03p.onrender.com/api/health/](https://skillbridge-backend-d03p.onrender.com/api/health/)

Render services may take a short time to wake after a period of inactivity.

## Application Preview

| Login | Student Dashboard |
| --- | --- |
| ![SkillBridge login page](screenshots/login-page.png) | ![SkillBridge student dashboard](screenshots/student-dashboard.png) |

| Opportunities | Recruiter Dashboard |
| --- | --- |
| ![SkillBridge opportunities page](screenshots/opportunities.png) | ![SkillBridge recruiter dashboard](screenshots/recruiter-dashboard.png) |

### Mentor / Learning

![SkillBridge mentor learning experience](screenshots/mentor-learning.png)

## Key features

### Student

- Maintain a profile with education, biography, location, skills, contact details, portfolio, GitHub, and LinkedIn links.
- Upload a profile image and a PDF resume of up to 5 MB.
- Browse and search active internships, jobs, projects, and freelance opportunities.
- Apply with confirmed contact information and optionally attach a snapshot of the current profile resume.
- Track application status across pending, reviewing, accepted, and rejected states.
- View role-aware dashboard application totals.

### Recruiter / startup

The backend stores this account role as `startup`; the frontend presents it as the recruiter workspace.

- Maintain a startup profile with organization details, stage, team size, links, and logo.
- Create, edit, view, and remove owned opportunities.
- Configure opportunity type, work mode, experience level, skills, stipend, deadline, and active status.
- Review applicants for owned opportunities, inspect shared profile information, and update application status.
- Download submitted resume snapshots through an authenticated endpoint.
- View opportunity and applicant totals on the dashboard.

### Mentor

- Maintain a mentor profile with biography, skills, company, job title, experience, LinkedIn URL, availability, and profile image.
- Discover members, send or respond to connection requests, and view accepted connections.
- Browse learning resources and track saved or completed items.
- Use a dedicated mentor workspace and profile experience.

### Platform

- Email-based authentication using JSON Web Token access and refresh tokens.
- Role-aware navigation and server-side authorization checks.
- Member discovery with search across names, roles, organizations, headlines, and skills.
- Connection requests with pending, accepted, rejected, retry, and connected states.
- Curated learning resources filtered by search, skill, difficulty, resource type, saved state, or completion state.
- Durable production media storage on Cloudinary, with images stored as image resources and PDF resumes stored as raw resources.
- Local filesystem media storage for development and isolated tests.
- Public backend health endpoint for service monitoring.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Lucide React, Motion, Recharts, React Hot Toast |
| Backend | Python, Django 6, Django REST Framework, Simple JWT |
| Database | PostgreSQL in production through Neon; SQLite fallback for local development |
| Media | Cloudinary, `django-cloudinary-storage`, Pillow |
| Production | Render Static Site, Render Web Service, Gunicorn |
| Supporting packages | `dj-database-url`, `django-cors-headers`, `python-dotenv`, Psycopg |

## Architecture

```text
Browser
  |
  v
React + Vite frontend
Render Static Site
  |
  | HTTPS / JSON / multipart forms / JWT
  v
Django REST API + Gunicorn
Render Web Service
  |                         |
  | relational data         | profile images, logos, PDF resumes
  v                         v
Neon PostgreSQL          Cloudinary
```

The React client reads its API base URL from `VITE_API_URL`. Django exposes REST endpoints under `/api/`, authenticates protected requests with JWT bearer tokens, stores relational state in PostgreSQL, and delegates production uploads to a project-owned Cloudinary storage backend. That backend routes images to Cloudinary's image resource type and PDFs to its raw resource type.

## Main workflow

1. A user account is created with a student, startup, or mentor role through the registration API.
2. The user signs in with an email and password and receives JWT access and refresh tokens.
3. The role determines the profile schema, navigation, dashboard data, and authorized actions.
4. Startup/recruiter users publish opportunities; authenticated users can browse active listings.
5. Students submit one application per opportunity with contact details and an optional profile-resume snapshot.
6. The opportunity owner reviews applicants and moves applications through the supported statuses.
7. Any authenticated member can discover other members and manage connection requests.
8. Members can explore curated learning resources, bookmark them, and record completion progress.

## Project structure

```text
SkillBridge/
|-- backend/
|   |-- accounts/          # Custom user model, registration, JWT-adjacent account APIs
|   |-- profiles/          # Student, startup, mentor, and skill profiles
|   |-- opportunities/     # Opportunity CRUD, permissions, dashboard statistics
|   |-- applications/      # Application workflow and protected resume downloads
|   |-- connections/       # Discovery and connection request lifecycle
|   |-- learning/          # Learning catalogue and per-user progress
|   |-- config/            # Django settings, root URLs, health check, media storage
|   |-- manage.py
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- public/            # Static icons and favicon
|   |-- src/
|   |   |-- components/    # Brand and shared layout components
|   |   |-- config/        # API base URL configuration
|   |   |-- pages/         # Role-aware application screens
|   |   `-- styles/        # Shared design tokens and layout styles
|   |-- package.json
|   |-- vite.config.js
|   `-- .env.example
`-- README.md
```

## Local development

### Prerequisites

- Python with `venv` and `pip`
- Node.js and npm
- Optional: a PostgreSQL database
- Optional: a Cloudinary account for testing production-style media storage

Cloudinary is disabled by default. Local development can use SQLite and `backend/media/` without any external services.

### 1. Clone and enter the repository

```bash
git clone <your-repository-url>
cd SkillBridge
```

### 2. Configure and install the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# macOS/Linux
source venv/bin/activate

# Windows PowerShell
venv\Scripts\Activate.ps1
```

Install dependencies and create a local environment file:

```bash
pip install -r requirements.txt
cp .env.example .env
```

On Windows PowerShell, the copy command is:

```powershell
Copy-Item .env.example .env
```

For the simplest local setup, remove or leave unset `DATABASE_URL`, set `DJANGO_DEBUG=True`, use local host/origin values, and keep `DJANGO_USE_CLOUDINARY=False`.

### Backend environment variables

| Variable | Purpose | Example placeholder |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Django signing secret; required when debug mode is off | `replace-with-a-long-random-secret` |
| `DJANGO_DEBUG` | Enables or disables Django debug mode | `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated permitted hostnames | `localhost,127.0.0.1` |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed by CORS | `http://localhost:5173` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Comma-separated trusted CSRF origins | `http://localhost:5173` |
| `DJANGO_SECURE_SSL_REDIRECT` | Controls HTTPS redirect when debug mode is off | `True` |
| `DATABASE_URL` | Production PostgreSQL connection URL; omit for local SQLite | `postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require` |
| `DJANGO_USE_CLOUDINARY` | Selects Cloudinary instead of local filesystem media | `False` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

When `DJANGO_USE_CLOUDINARY=True`, all three Cloudinary variables are required. Never commit `.env` files or real credentials.

### 3. Apply database migrations

```bash
python manage.py migrate
```

If `DATABASE_URL` is absent, Django uses `backend/db.sqlite3`. When `DATABASE_URL` is present, Django parses it through `dj-database-url` and uses the configured PostgreSQL database with persistent connections and SSL required.

Create an administrator account if you need Django admin access or want to curate learning resources:

```bash
python manage.py createsuperuser
```

### 4. Run the backend

The frontend's development fallback expects the API on port `8001`:

```bash
python manage.py runserver 8001
```

The local API is then available at `http://127.0.0.1:8001/api/`.

### 5. Configure and run the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8001/api
```

Then start Vite:

```bash
npm run dev
```

Vite serves the development application at the URL printed in the terminal, normally `http://localhost:5173`.

### Frontend environment variables

| Variable | Purpose | Example placeholder |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api` and without a trailing slash | `http://127.0.0.1:8001/api` |

## API overview

All application endpoints are rooted at `/api/`.

| Prefix | Responsibility |
| --- | --- |
| `/api/auth/` | Registration, JWT login and refresh, current user, password change |
| `/api/profiles/` | Retrieve and update the authenticated user's role-specific profile |
| `/api/opportunities/` | Opportunity listing, search, ownership workflows, dashboard statistics |
| `/api/applications/` | Student applications, applicant review, status updates, protected resume downloads |
| `/api/connections/` | Member discovery, incoming requests, responses, accepted connections |
| `/api/learning/` | Resource listing and filters, skills, bookmarks, completion progress |
| `/api/health/` | Public service-health response |

Except for registration, login, token refresh, and health checking, API access requires an authenticated request. The health endpoint returns a small JSON response confirming that the backend is running.

## Testing and quality checks

The repository currently contains 40 Django backend tests covering:

- the public health endpoint;
- role-specific profiles and phone-number validation;
- opportunity visibility and dashboard counts;
- application permissions, duplicate prevention, deadlines, contact snapshots, resume copying, and protected downloads;
- member discovery and connection-request rules;
- learning bookmarks, completion state, filtering, and ownership;
- mocked Cloudinary storage behavior for image and raw PDF resources.

Cloudinary tests mock SDK and HTTP operations; they do not upload, fetch, or delete real assets. Application media tests explicitly use temporary filesystem storage.

Run the backend suite and configuration checks from `backend/`:

```bash
python manage.py check
python manage.py test
python manage.py makemigrations --check
```

The frontend currently provides an ESLint command but has no automated frontend test suite:

```bash
cd frontend
npm run lint
npm run build
```

## Production deployment

The production architecture is split across managed services:

- **Frontend:** React/Vite build hosted as a Render Static Site.
- **Backend:** Django REST Framework served by Gunicorn as a Render Web Service.
- **Database:** PostgreSQL hosted on Neon and supplied through `DATABASE_URL`.
- **Media:** Cloudinary stores student and mentor profile images, startup logos, student resumes, and application resume snapshots. Images use Cloudinary image resources; PDFs use raw resources.

Production must set `VITE_API_URL` to the public backend URL with `/api`, enable Cloudinary with `DJANGO_USE_CLOUDINARY=True`, configure the allowed host and frontend origin lists, and provide all required database and Cloudinary credentials through the hosting environment.

This repository does not currently include a tracked Render blueprint, Dockerfile, or Procfile, so platform service settings and build/start commands are managed outside the repository.

## Security and configuration notes

- Django's standard password validators apply during registration and password changes.
- Protected APIs use Simple JWT bearer authentication.
- The current frontend stores access and refresh tokens in browser `localStorage`; deployments should enforce HTTPS and a restrictive content security policy.
- Opportunity editing is limited to the creator, and applicant information is limited to the opportunity owner.
- Application resume downloads are restricted to the applicant and the opportunity owner.
- Connection discovery intentionally excludes private contact and resume data.
- Duplicate applications and duplicate connection pairs are prevented by database constraints and API validation.
- Production enables secure session and CSRF cookies and can enforce HTTPS redirection.
- CORS origins, CSRF origins, and allowed hosts are supplied explicitly through environment variables.
- PDF resumes are restricted by extension and a 5 MB size validator. File-extension checks alone are not comprehensive content inspection.
- Development media is served by Django only in debug mode; production media uses Cloudinary.
- Existing local or stale media records are not uploaded to Cloudinary automatically.

## Frontend SEO

The production frontend is available at `https://skillbridge-frontend-jkgi.onrender.com`. Its sitemap is served at `/sitemap.xml`, and crawler guidance is served at `/robots.txt`. The landing page, login page, and registration page are the public routes intended for indexing. Authenticated dashboards, profiles, applications, connections, learning, opportunity management, and settings routes are excluded from the sitemap and receive client-side `noindex` metadata.

SkillBridge is a client-rendered React/Vite application. Metadata is present in the base HTML and updated per route in the browser, but crawler support is not as consistent as server-side rendering or pre-rendering. Pre-rendering the public routes is a possible future improvement.

## Future ideas

The following are potential enhancements, not current features:

- Add a user-facing registration and account-verification flow to the React application.
- Add secure direct messaging or mentor-session scheduling between accepted connections.
- Add notification delivery for application-status and connection-request changes.
- Add richer recruiter search, applicant filtering, and opportunity analytics.
- Add automated frontend component and end-to-end tests.
- Add content-type and malware inspection for uploaded documents.
- Add a tracked infrastructure blueprint or container-based deployment workflow.
- Add accessibility audits and broader responsive-browser coverage.

## License

No license file is currently included. All rights remain with the repository owner unless a license is added.
