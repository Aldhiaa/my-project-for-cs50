from rest_framework import serializers
from myplaces.models import *


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username')


class CategorySeralizer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


class PlaceSeralizer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M")
    person = UserSerializer()
    categories = CategorySeralizer(many=True)

    class Meta:
        model = Place
        fields = '__all__'

