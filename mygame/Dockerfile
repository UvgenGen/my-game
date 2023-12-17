FROM python:3.8
ENV PYTHONUNBUFFERED 1
RUN mkdir /mygame
WORKDIR /mygame
COPY requirements.txt /mygame/
RUN pip install --upgrade pip && pip install -r requirements.txt
ADD . /mygame/

# Run migrations and create superuser
RUN python manage.py migrate
RUN echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
User.objects.filter(email='admin@example.com').exists() or \
User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python manage.py shell
