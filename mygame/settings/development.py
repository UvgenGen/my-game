from .common import *

DEBUG = True


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases
SECRET_KEY = 'django-insecure-8!_9z6utv5nq%5gh!vl304aerp1)^@*jc3@tv6w-c^%1o06rok'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_django',
        'USER': 'root',
        'PASSWORD': 'password',
        'HOST': 'db',
        'PORT': '3306',
    }
}


NEXTJS_SETTINGS = {
    "nextjs_server_url": "http://frontend-app-mygame:3000",
}


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}