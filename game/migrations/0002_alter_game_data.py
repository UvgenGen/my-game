# Generated by Django 4.1.3 on 2023-06-09 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='data',
            field=models.JSONField(default=dict),
        ),
    ]