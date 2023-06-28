FROM python:3.8
ENV PYTHONUNBUFFERED 1
RUN mkdir /mygame
WORKDIR /mygame
COPY requirements.txt /mygame/
RUN pip install --upgrade pip && pip install -r requirements.txt
ADD . /mygame/
