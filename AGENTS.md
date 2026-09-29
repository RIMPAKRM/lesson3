# Карта проекта lesson3

Учебный монорепозиторий: JWT-аутентификация (Django REST + React).
Последнее обновление: 2026-09-29.

## Структура

```
lesson3/
├── AGENTS.md              # этот файл
├── .aider.conf.yml        # конфиг Aider (модель gemini-3.1-flash-lite)
├── .env                   # GEMINI_API_KEY (в .gitignore, не коммитить)
├── .gitignore
├── front/
│   └── vite-project/      # фронтенд
│       ├── package.json
│       ├── vite.config.js
│       └── src/
│           ├── App.jsx            # маршруты: /login, /register, /profile
│           ├── main.jsx
│           ├── api/axios.js       # axios instance, baseURL http://localhost:8000/api/v1/,
│           │                      # авто-refresh access-токена при 401
│           ├── components/
│           │   ├── LoginForm.jsx
│           │   ├── RegisterForm.jsx
│           │   └── ProtectedRoute.jsx  # редирект на /login если нет токена в localStorage
│           └── pages/
│               └── Profile.jsx    # GET /auth/me/, logout чистит localStorage
└── back/
    ├── manage.py          # точка входа Django
    ├── db.sqlite3         # в .gitignore, локально не коммитить
    ├── venv/              # venv (Python 3.13.9), в git не попадает
    ├── config/            # Django-проект (settings, urls, asgi, wsgi)
    └── users/             # единственное приложение (JWT-аутентификация + профили)
        ├── models.py      # UserProfile (OneToOne → User) + сигнал post_save
        ├── views.py       # RegisterView, UserProfileView (GET/PATCH)
        ├── serializers.py # UserSerializer, RegisterSerializer, UserProfileSerializer
        ├── admin.py       # UserProfileInline в CustomUserAdmin
        ├── urls.py
        └── migrations/    # 0001_initial (UserProfile)
```

## Backend

- **Стек:** Django 6.1.1, DRF 3.18.1, SimpleJWT 5.5.1, django-cors-headers 4.9.0, SQLite
- **Settings:** `back/config/settings.py` (ROOT_URLCONF = `config.urls`)
- **REST Framework:** аутентификация только через `rest_framework_simplejwt.authentication.JWTAuthentication`
- **SimpleJWT:** access — 15 минут, refresh — 1 день (`SIMPLE_JWT` в settings)
- **CORS:** явный список `CORS_ALLOWED_ORIGINS` = localhost:5173 / 127.0.0.1:5173 (Vite dev)
- **UserProfile:** создаётся автоматически сигналом `post_save` при создании `User`; `UserProfileView.get_object` делает `get_or_create` на случай старых пользователей без профиля

### API (все под префиксом `/api/v1/auth/`)

| Метод  | Путь         | Описание                                     | Доступ          |
|--------|--------------|----------------------------------------------|-----------------|
| POST   | `/register/` | регистрация (username, email, password)      | AllowAny        |
| POST   | `/login/`    | SimpleJWT TokenObtainPair → access+refresh   | AllowAny        |
| POST   | `/refresh/`  | обновление access-токена                     | AllowAny        |
| GET    | `/me/`       | username, email, bio, avatar_url, created_at | IsAuthenticated |
| PATCH  | `/me/`       | частичное обновление bio и avatar_url        | IsAuthenticated |

## Frontend

- **Стек:** React 19, Vite 8, React Router 7, Axios 1.20, prop-types
- **Токены:** хранятся в `localStorage` (`access`, `refresh`); request-интерцептор добавляет `Authorization: Bearer <access>`; response-интерцептор при 401 обновляет access через `/auth/refresh/` (флаг `_retry` против зацикливания), при неудаче чистит localStorage и редиректит на `/login`
- **Маршруты:** `/` → LoginForm, `/login`, `/register`, `/profile` (защищён ProtectedRoute)

## Команды

```bash
# Backend (из корня репозитория)
back/venv/Scripts/python.exe back/manage.py runserver    # http://localhost:8000
back/venv/Scripts/python.exe back/manage.py migrate
back/venv/Scripts/python.exe back/manage.py check

# Frontend
cd front/vite-project
npm install
npm run dev        # Vite dev server
npm run lint       # ESLint 9 (flat config, eslint.config.js)
npm run build
```

## Известные проблемы (на 2026-09-29)

1. Для продакшена: `SECRET_KEY` в коде и `DEBUG=True` — только для разработки, вынести в переменные окружения.
2. Нет тестов (ни Django, ни фронтенд).

## Конвенции

- Язык общения с пользователем: русский.
- Комментарии/строки в UI фронтенда — на английском.
- Git: коммиты в стиле `feat: ...` / `feat(ai): ...` (Aider настроен на auto-commits).
- Не коммитить: `.env`, `.aider*`, `venv/`, `node_modules/`, `db.sqlite3`, `__pycache__/`.
