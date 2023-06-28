# Generated by Django 4.1.3 on 2023-06-28 19:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_alter_game_data'),
        ('chat', '0003_message_delete_chat'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='game',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.game'),
        ),
    ]
