# Generated by Django 4.1.3 on 2023-06-09 21:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserProfile',
        ),
    ]
