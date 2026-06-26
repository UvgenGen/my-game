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
        'HOST': 'mysql',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4'
        }
    }
}


NEXTJS_SETTINGS = {
    "nextjs_server_url": "http://frontend-app-mygame:3000",
}


# Use the pub/sub channel layer rather than the default RedisChannelLayer:
# under channels_redis 4.3 + redis-py 8 the blocking-pop receive loop of
# RedisChannelLayer raises redis.exceptions.TimeoutError ("Timeout reading
# from redis") inside await_many_dispatch, killing live WebSocket connections.
# RedisPubSubChannelLayer has no blocking-receive loop and avoids the issue.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.pubsub.RedisPubSubChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
