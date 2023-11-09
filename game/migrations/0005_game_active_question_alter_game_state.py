# Generated by Django 4.1.3 on 2023-08-27 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_alter_game_created_at_alter_game_creator_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='active_question',
            field=models.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='game',
            name='state',
            field=models.CharField(choices=[('SELECT_ACTIVE_USER', 'Selecting Active User'), ('SELECT_QUESTION', 'Selecting Question'), ('SHOW_QUESTION', 'Showing Question'), ('CAT_IN_A_BAG', 'Cat in a Bag'), ('RATE_QUESTION', 'Rate Question'), ('ANSWERING', 'Answering'), ('SHOW_ANSWER', 'Show Answer'), ('FINAL', 'Final')], max_length=50),
        ),
    ]