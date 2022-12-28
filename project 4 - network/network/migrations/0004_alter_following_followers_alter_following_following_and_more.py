# Generated by Django 4.1 on 2022-09-13 14:49

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_alter_user_profile_image_post_like_following_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='following',
            name='followers',
            field=models.ManyToManyField(blank=True, null=True, related_name='users_followers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='following',
            name='following',
            field=models.ManyToManyField(blank=True, null=True, related_name='users_followings', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='like',
            name='people_liking_the_post',
            field=models.ManyToManyField(blank=True, null=True, related_name='people_liking', to=settings.AUTH_USER_MODEL),
        ),
    ]
