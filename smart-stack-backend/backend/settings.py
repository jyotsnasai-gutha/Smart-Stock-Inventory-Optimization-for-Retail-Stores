from dotenv import load_dotenv
from pathlib import Path
import os
load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY","dev-secret")
DEBUG = True
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS = [
    "django.contrib.admin","django.contrib.auth","django.contrib.contenttypes",
    "django.contrib.sessions","django.contrib.messages","django.contrib.staticfiles",
    "rest_framework","corsheaders","inventory",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
CORS_ALLOW_ALL_ORIGINS = True
ROOT_URLCONF="backend.urls"
TEMPLATES=[{
 "BACKEND":"django.template.backends.django.DjangoTemplates",
 "DIRS":[], "APP_DIRS":True,
 "OPTIONS":{"context_processors":[
 "django.template.context_processors.debug",
 "django.template.context_processors.request",
 "django.contrib.auth.context_processors.auth",
 "django.contrib.messages.context_processors.messages",
 ]},
}]
WSGI_APPLICATION="backend.wsgi.application"
DATABASES={
 "default":{
  "ENGINE":"django.db.backends.mysql",
  "NAME":os.environ.get("MYSQL_DB"),
  "USER":os.environ.get("MYSQL_USER"),
  "PASSWORD":os.environ.get("MYSQL_PASS"),
  "HOST":os.environ.get("MYSQL_HOST"),
  "PORT":os.environ.get("MYSQL_PORT"),
 }
}
STATIC_URL="/static/"
