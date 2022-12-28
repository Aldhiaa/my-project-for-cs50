from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from network.serializers import *
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.views.generic import ListView
import json
from .models import User, Following, Post

# Pagniate for every 10 post
class PostView(ListView):
    paginate_by = (10)
    model = Post

def index(request):
    user = request.user
    posts = Post.objects.all().order_by('-date')

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Creating a variable for each post that will return true is the user connected already liked that post
    for post in page_obj:
        post.liked = post.is_liked(user)
        post.date = post.date.strftime('%Y-%m-%d %H:%M')

    return render(request, "network/index.html", {
        "user": user,
        "posts": posts,
        'page_obj': page_obj
    })


def follow(request, id):
    user = request.user

    # Getting the user to follow
    user_to_follow = User.objects.get(id = id)

    # Creating the new following
    new_follow = Following(
        follower=user,
        followed=user_to_follow
    )
    new_follow.save()

    return HttpResponseRedirect(reverse("profile", args=(id, )))

def unfollow(request, id):
    user = request.user

    # Getting the user to Unfollow
    user_to_unfollow = User.objects.get(id = id)

    # Getting the following to delete
    follow_to_delete = Following.objects.get(follower=user,followed=user_to_unfollow)
    follow_to_delete.delete()

    return HttpResponseRedirect(reverse("profile", args=(id, )))

@login_required(login_url='login')
def profile(request, id):
    user_authenticated = request.user
    user_profile = User.objects.get(id = id)
    img = str(user_profile.profile_image.url)

    # Calling the method is followed to check if the user of the profile visited is followed by the user connected
    isFollowed = user_profile.is_followed(user_authenticated)

    # Getting all posts from the user
    posts = Post.objects.filter(author = user_profile).all().order_by('-date')

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    for post in page_obj:
        post.liked = post.is_liked(user_authenticated)
        post.date = post.date.strftime('%Y-%m-%d %H:%M')
    
    return render(request, "network/profile.html", {
        "user_profile": user_profile,
        "img":img,
        "user": user_authenticated,
        "posts" : posts,
        'page_obj': page_obj,
        "isFollowed": isFollowed
    })


def following_page(request):
    user = request.user

    # Getting all the ID's of the users who are in the followings of the connected user
    followed_people = user.followings.all().values_list('followed_id')

    # Filtering posts by checking if the author_id is in the list of the people_id we follow list.
    posts = Post.objects.filter(author_id__in=followed_people).order_by('-date')

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    for post in page_obj:
        post.liked = post.is_liked(user)
        post.date = post.date.strftime('%Y-%m-%d %H:%M')

    return render(request, "network/following_page.html", {
        "user": user,
        "posts": posts,
        "followed_people" : followed_people,
        'page_obj': page_obj
    }) 


@login_required(login_url='login')
def newPost(request):
    if request.method == "POST":
        author = request.user
        post_content = json.loads(request.body)['content']

        # Creating the new Post by adding the data into the model Post
        newPost = Post(
            author=author,
            content=post_content,    
        )
        newPost.save()

        serializer = PostSerializer(newPost)
        return JsonResponse(serializer.data)
    else:
        message = "Request Should be a POST request"
        return JsonResponse(message, safe=False)


def deletePost(request, post_id):
    if request.method =="DELETE":
        post_to_delete = Post.objects.get(id=post_id, author=request.user)

        # If the post exist, we delete it
        if post_to_delete:
            post_to_delete.delete()
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=404)

    else:
        message = "Request Should be a DELETE request"
        return JsonResponse(message, safe=False)


@csrf_exempt
def new_edit(request, post_id):
    if request.method == "PUT":
        newEdit = json.loads(request.body)['newEdit']

        # Ensuring that only the author of the post can edit that post
        post = Post.objects.filter(id = post_id, author=request.user).first()
        
        # Updating the content of the current post and saving it
        post.content = newEdit
        post.save()

        return JsonResponse(newEdit, safe=False)
    else:
        error_msg = "Request Should be a Put request"
        return JsonResponse(error_msg, safe=False)


def like(request, post_id):
    if request.method == "POST":
        user = request.user
        post_to_like = Post.objects.get(id=post_id)

        # Checking if the post has been liked by the user logged in
        like = Like.objects.filter(post=post_to_like, liker=user).first()

        # If the post has been liked already, we delete that like
        if like:
            like.delete()
            return HttpResponse(status=204)
        
        # Otherwise, we will create that like
        else:
            new_like = Like(
                post=post_to_like,
                liker=user,   
            )
            new_like.save()

            return HttpResponse(status=201)
    else:
        message = "Request Should be a POST request"
        return JsonResponse(message, safe=False)


def editProfile(request, profile_id):
    if request.method == "POST":

        # Retrieving the profile to edit in the data base
        user_profile = User.objects.filter(id = profile_id).first()
        image = request.FILES.get("image")
        newBio = request.POST.get("newBio")

        if image is None:
            if newBio == "" or newBio == "No bio":
                print("No bio & image change")
                user_profile.bio = None

            elif newBio != "" or newBio != "No bio":
                print("No image but new bio found")
                user_profile.bio = newBio

        elif image is not None:
            if newBio == "" or newBio == "No bio":
                print("Only new image found")
                user_profile.profile_image = image
                user_profile.bio = None

            elif newBio != "" or newBio != "No bio":
                print("New Image and new Bio found")
                user_profile.profile_image = image
                user_profile.bio = newBio
        
        # Saving the profile after the edit
        user_profile.save()

        serializer = UserSerializer(user_profile)
        return JsonResponse(serializer.data, status=201)
  
    else:
        error_msg = "Request Should be a POST request"
        return JsonResponse(error_msg, safe=False)


def login_view(request):
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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
