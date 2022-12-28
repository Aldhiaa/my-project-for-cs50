from rest_framework import serializers
from network.models import *


class FollowingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Following
        fields = ('id','follower', 'followed')

class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y-%m-%d")
    followers = FollowingSerializer(many=True)
    followings = FollowingSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'bio', 'profile_image', 'date_joined', 'followers', 'followings')


class LikeSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M")
    liker = UserSerializer()

    class Meta:
        model = Like
        fields = ('id', 'liker', 'date')


class PostSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M")

    author = UserSerializer()
    likes = LikeSerializer(many=True)

    class Meta:
        model = Post
        fields = ('id','author', 'content', 'imageURL', 'date', 'likes')




