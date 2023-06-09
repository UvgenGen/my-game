FROM python:3.8
ENV PYTHONUNBUFFERED 1
RUN mkdir /notifier
WORKDIR /notifier
COPY requirements.txt /notifier/
RUN pip install --upgrade pip && pip install -r requirements.txt
ADD . /notifier/
# Run migrations (if applicable)
RUN python manage.py migrate
