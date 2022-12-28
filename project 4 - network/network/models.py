from django.contrib.auth.models import AbstractUser
from django.db import models
from django_resized import ResizedImageField
from datetime import datetime



class User(AbstractUser):
    bio = models.CharField(blank=True, null=True, max_length=500)
    profile_image = ResizedImageField(size=[600,600], default="network/static/profile_pictures/default.jpeg", upload_to="network/static/profile_pictures")

    def is_followed(self, user):
        followers = self.followers.all()
        for person in followers:
            if user == person.follower:
                return True
        return False

    def __str__(self):
        return self.username


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="comment_person")
    content = models.TextField()
    imageURL = models.CharField(max_length=2000, blank=True, null=True,)
    date = models.DateTimeField(auto_now_add=True)
    nb_likes = models.PositiveIntegerField(default=0)

    def is_liked(self, user):
        likes = self.likes.all()
        for like in likes:
            if user == like.liker:
                return True
        return False
    
    def __str__(self):
        return f"{self.id} - {self.author.username} posted on {self.date.strftime('%d %b %Y %H:%M:%S')} - Likes: TODO"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True, related_name="likes")
    liker = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="likers")
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.id } - {self.liker} liked a post on {self.date.strftime('%d %b %Y %H:%M:%S')}"


class Following(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="followings")
    followed = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="followers")

    
    def __str__(self):
        return f"{self.id} - {self.follower.username} started following {self.followed.username}"


