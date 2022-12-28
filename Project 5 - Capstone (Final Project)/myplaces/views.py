from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from myplaces.serializers import *
from rest_framework import status
from .models import User, Category, Place

# Function to convert strings into List -> hello,world -> ['hello', 'world']
def Convert(string):
    li = list(string.split(","))
    return li

@login_required(login_url='login') 
def index(request):
    """
    This is the function that redirects us after a successful login.
    This function simply send all the categories as informations
    so we can iterate trough them and display them all in our form to create a new place.
    """
    categories = Category.objects.all()

    return render(request, "myplaces/index.html", { 
        'categories': categories,
    })

@login_required(login_url='login')
def submitNewPlace(request):
        """
        This function enables us to create a new place.
        """
        if request.method == "POST":
            user = request.user

            user_profile = User.objects.get(id = user.id)

            # Retrieving the data received
            title = request.POST.get("title")
            description = request.POST.get("description")
            address = request.POST.get("address")
            latitude = request.POST.get("latitude")
            longitude = request.POST.get("longitude")
            image = request.FILES.get("image")
            category = request.POST.get("category")

            # Converting the category string into a List to retrieve each element - if more than one
            list_category = Convert(category) # convert 'food,drink' -> ['food', 'drink']

            # Creating a New Place
            newPlace = Place.objects.create(
                person = user_profile,
                title=title,
                description=description,
                longitude=longitude,
                latitude=latitude,
            )

            # Checking if an address has been submitted as it is optional
            if address != '':
                newPlace.address = address
            
            # Checking if an image has been submitted as it is optional
            if image is not None :
                newPlace.image = image

            # As the user can select more than one category for his place, we need to iterate trough the results and add each category one by one
            for eachCategory in list_category:
                cat = Category.objects.get(name=eachCategory)
                newPlace.categories.add(cat)
            
            # Saving the profile after the edit
            newPlace.save()
            
            # Serializing the results for the new place in order to send it back in the response, so we can add it to the map directly.
            serializer = PlaceSeralizer(newPlace)

            return JsonResponse(
                {'message': 'New place saved Successfully!', 'newPlace': serializer.data},
                status=status.HTTP_201_CREATED)

        else:
            return JsonResponse(
                {'error': 'Request Should be a POST request'},
                status=status.HTTP_400_BAD_REQUEST)


@login_required(login_url='login')
def submitEditPlace(request):
        """
        This function enables us to edit any place created by the user.
        It will check if the place exists and belongs to the user.
        If yes, it will update the existing place with the new informations givent by the user.
        """
        if request.method == "POST":
            user = request.user

            user_profile = User.objects.get(id = user.id)

            # Retrieving the data received
            id_place = request.POST.get("id")
            title = request.POST.get("title")
            description = request.POST.get("description")
            address = request.POST.get("address")
            latitude = request.POST.get("latitude")
            longitude = request.POST.get("longitude")
            image = request.FILES.get("image")
            category = request.POST.get("category")


            # Converting the category string into a List to retrieve each element - if more than one
            list_category = Convert(category) # convert 'food,drink' -> ['food', 'drink']

            # Checking if the place exists and if it belong to the logged in user
            if Place.objects.filter(id = id_place, person=user_profile).exists():
                place = Place.objects.get(id = id_place, person=user_profile)

                place.title = title
                place.description = description
                place.address = address
                place. latitude = latitude
                place.longitude = longitude
            
                # Checking if a new image has been submitted as it is optional. If yes, we update it.
                if image is not None :
                    place.image = image

                # As the user can select more than one category for his place, we need to iterate trough the results and add each category one by one
                # But first, we clear the category already selected in order to add the new ones
                place.categories.clear()

                for eachCategory in list_category:
                    cat = Category.objects.get(name=eachCategory)
                    place.categories.add(cat)
                
                # Saving the place updated after the edit
                place.save()
                
                # Serializing the results for the updated place in order to send it back in the response, so we can add it to the page directly.
                serializer = PlaceSeralizer(place)


                return JsonResponse(
                {'message': 'Place updated Successfully!', 'update': serializer.data},
                status=status.HTTP_201_CREATED)

            else:
                return JsonResponse(
                    {'error': 'No places found, an error occured during the request.'},
                    status=status.HTTP_404_NOT_FOUND)

        else:
            return JsonResponse(
                {'error': 'Request Should be a POST request'},
                status=status.HTTP_400_BAD_REQUEST)


@login_required(login_url='login')
def deletePlace(request, id):
    """
    This function receive the id of the place to delete.
    It will check if the place exists and delete it.
    """

    if request.method == "DELETE":
        user = request.user
        
        # Making sure that the place exists and that this place belongs to the user making that request.
        if Place.objects.filter(pk=id, person=user).exists():
            place_to_delete = Place.objects.get(pk=id)

            place_to_delete.delete()

            return JsonResponse(
                        {'message': 'Places deleted successfully!'}, 
                        safe=False, status=status.HTTP_200_OK)
        else:
            return JsonResponse(
                {'error': 'This location was not found for this user.'},
                status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse(
                {'error': 'Request should be a DELETE request'},
                status=status.HTTP_400_BAD_REQUEST)


@login_required(login_url='login')
def getUserLocations(request):
        """
        This function returns a list of locations created by the user.
        """
        if request.method == "GET":
            user = request.user

            allCategories = Category.objects.all()
            categorySerialized = CategorySeralizer(allCategories, many=True)

            # Retrieving the logged in user
            user_profile = User.objects.get(id = user.id)

            # Checking if user has created new places or not.
            if Place.objects.filter(person = user_profile).exists():
                
                # Retrieving places created by this user
                places = Place.objects.filter(person = user_profile).all().order_by('-date')
                serializer = PlaceSeralizer(places, many=True)

                return JsonResponse(
                    {'message': 'All places retrieved successfully!', 'Places': serializer.data, 'allCategories': categorySerialized.data}, 
                    safe=False, status=status.HTTP_200_OK)
            else:
                return JsonResponse(
                    {'error': 'No Locations created for this user yet.'},
                    status=status.HTTP_404_NOT_FOUND)
        else:
            return JsonResponse(
                {'error': 'Request Should be a GET request'},
                status=status.HTTP_400_BAD_REQUEST)


@login_required(login_url='login')
def getLocationsByCategory(request, category):
        """
        This function will take into arguments a category.
        It returns a list of locations for the given category, if they exist.
        """
        if request.method == "GET":

            allCategories = Category.objects.all()
            categorySerialized = CategorySeralizer(allCategories, many=True)

            # Retrieving the logged in user
            user_profile = User.objects.get(id=request.user.id)

            if category == 'all':

                # Checking if user has created any places or not.
                if Place.objects.filter(person=user_profile).exists():
                    
                    # Retrieving all places created by this user
                    places = Place.objects.filter(person = user_profile).all().order_by('-date')
                    serializer = PlaceSeralizer(places, many=True)

                    return JsonResponse(
                        {'message': 'All places retrieved successfully!', 'Places': serializer.data, 'allCategories': categorySerialized.data}, 
                        safe=False, status=status.HTTP_200_OK)
                else:
                    return JsonResponse(
                        {'error': 'No Locations created for this user yet.'},
                        status=status.HTTP_404_NOT_FOUND)

            else:
                category_selected = Category.objects.get(name=category)

                # Checking if Places with that category and this user exist.
                if Place.objects.filter(person=user_profile, categories=category_selected).exists():
                    
                    # Retrieving places created by this user containing that category
                    places = Place.objects.filter(person=user_profile, categories=category_selected).all().order_by('-date')
                    serializer = PlaceSeralizer(places, many=True)
                    categorySelected = CategorySeralizer(category_selected)

                    return JsonResponse(
                        {'message': 'Places retrieved successfully!', 'Places': serializer.data, 'Category Selected': categorySelected.data ,'allCategories': categorySerialized.data}, 
                        safe=False, status=status.HTTP_200_OK)
                else:
                    return JsonResponse(
                        {'error': 'No Locations created within that category yet.'},
                        status=status.HTTP_404_NOT_FOUND)
        else:
            return JsonResponse(
                {'error': 'Request Should be a GET request'},
                status=status.HTTP_400_BAD_REQUEST)


@login_required(login_url='login')
def myplaces(request):
    """
    Simple function to direct us to the Myplaces page.
    We will send all the categoies that exist in order 
    to iterate through them and display all of them.
    """

    categories = Category.objects.all()

    return render(request, "myplaces/my_places.html", {
        'categories': categories,
    })


def login_view(request):
    """
    Login Page
    """
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "myplaces/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "myplaces/login.html")


def logout_view(request):
    """
    Logout function
    """
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    """
    Register page
    """
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "myplaces/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "myplaces/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "myplaces/register.html")
