from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .models import User, Listing, Category, Comment, Bid


def index(request):
    active_Listing = Listing.objects.filter(isActive=True)
    everyCategories = Category.objects.all()
    return render(request, "auctions/index.html", {
        "active_Listing": active_Listing,
        "everyCategories": everyCategories,
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def create_listing(request):
    if request.method == "GET":
        everyCategories = Category.objects.all()
        return render(request, "auctions/create_listing.html", {
            "everyCategories": everyCategories
        })
    else:
        # Who the user is
        user = request.user
        # Every entry needed to create a listing submitted frmo the user
        imageURL = request.POST["imageURL"]
        title = request.POST["title"]
        description = request.POST["description"]
        category = request.POST["category"]
        starting_price = request.POST["starting_price"]

        # Getting the category input into our category table
        category_selected = Category.objects.get(
            name=category
        )

        # Creating the new listing by adding the data into the class Listing
        new_listing = Listing(
            imageURL=imageURL,
            title=title,
            description=description,
            category=category_selected,
            starting_price=float(starting_price),
            owner=user,     
        )

        # Saving the new listing int the DB
        new_listing.save()
        
        # Redirecting to the index page where we will see the Listing appear
        return HttpResponseRedirect(reverse(index))
        
def bid_won(request):
    # Who the user is
    user = request.user
    Bid_won_by_user = Listing.objects.filter(winner=user)
    return render(request, "auctions/bids_won.html", {
        "Bid_won_by_user": Bid_won_by_user
    })


def show_listing_by_category(request):
    if request.method == "POST":
        category_selected = request.POST["category_selected"]
        if category_selected == "All_Categories":
            active_Listing = Listing.objects.filter(isActive=True)
            everyCategories = Category.objects.all()
        else:
            category = Category.objects.get(name=category_selected)
            active_Listing = Listing.objects.filter(isActive=True, category=category)
            everyCategories = Category.objects.all()
        return render(request, "auctions/index.html", {
            "active_Listing": active_Listing,
            "everyCategories": everyCategories,
        })


def listing_page_info(request, id):
    listing_info = Listing.objects.get(id=id)
    ListingInUserWatchlist = request.user in listing_info.watchlist.all()
    item_Comment = Comment.objects.filter(listing=listing_info)
    user = request.user

    # Check if listing is active
    isActive = listing_info.isActive

    # Checking if the user looged in is the same as the one who created the listing we are visiting
    owner = request.user.username == listing_info.owner.username

    last_bid_on_this_listing = Bid.objects.filter(listing=listing_info).last()
    return render(request, "auctions/listing_page_info.html", {
        "listing_info": listing_info,
        "ListingInUserWatchlist": ListingInUserWatchlist,
        "item_Comment": item_Comment,
        "user": user,
        "last_outbid": last_bid_on_this_listing,
        "owner": owner,
        "isActive": isActive
    })

@login_required
def close_auction(request, id):
    listing = Listing.objects.get(id=id)
    last_bid_on_this_listing = Bid.objects.filter(listing=listing).last()
    winner = last_bid_on_this_listing.person
    listing.isActive = False
    listing.winner = winner
    listing.save()
    
    return HttpResponseRedirect(reverse("listing_page_info", args=(id,)))


@login_required
def addtowatchlist(request, id):
    # Who the user is
    user = request.user
    listing_info = Listing.objects.get(id=id)
    listing_info.watchlist.add(user)
    # Redirecting to the same page and specifying as argument the ID we had for that same product added to watchlist
    return HttpResponseRedirect(reverse("listing_page_info", args=(id, )))


@login_required
def removefromwatchlist(request, id):
    # Who the user is
    user = request.user
    listing_info = Listing.objects.get(id=id)
    listing_info.watchlist.remove(user)
    # Redirecting to the same page and specifying as argument the ID we had for that same product added to watchlist
    return HttpResponseRedirect(reverse("show_watchlist"))


@login_required
def show_watchlist(request):
    # Who the user is
    user = request.user
    listing_to_show = user.user_watchlist.all()
    return render(request, "auctions/watchlist.html", {
        "listing_to_show": listing_to_show,
    })

@login_required
def comment(request, id):
    user = request.user
    listing_selected = Listing.objects.get(id=id)
    new_comment = request.POST["new_comment"]

    new_comment = Comment(
        person = user,
        comment = new_comment,
        listing = listing_selected
    )

    new_comment.save()

    return HttpResponseRedirect(reverse("listing_page_info", args=(id, )))

@login_required
def delete_comment(request, id):
    user = request.user
    comment_to_delete = Comment.objects.get(id=id)
    comment_to_delete.delete()
    id_listing = request.POST["id_listing"]

    return HttpResponseRedirect(reverse("listing_page_info", args=(id_listing, )))

@login_required
def bid(request, id):
    user = request.user
    bid = request.POST["bid"]

    # Getting the right listing we are bidding on
    listing_info = Listing.objects.get(id=id)
    # Getting the initial price of that listing, in order to make sure, later, that the new bid is bigger than the initial price
    listing_initial_price = listing_info.starting_price

    # Check if listing is active
    isActive = listing_info.isActive

    ListingInUserWatchlist = request.user in listing_info.watchlist.all()
    item_Comment = Comment.objects.filter(listing=listing_info)
    owner =request.user.username == listing_info.owner.username

    Bid_on_this_listing = Bid.objects.filter(listing=listing_info)
    if Bid_on_this_listing.exists():
        last_bid_on_this_listing = Bid.objects.filter(listing=listing_info).last()
        if float(bid) > float(last_bid_on_this_listing.price):
            actualBid = Bid(
                person = user,
                listing = listing_info,
                price = float(bid),
            )
            actualBid.save()

            last_bid_on_this_listing = Bid.objects.filter(listing=listing_info).last()
            return render(request, "auctions/listing_page_info.html", {
                "listing_info": listing_info,
                "ListingInUserWatchlist": ListingInUserWatchlist,
                "item_Comment": item_Comment,
                "user": user,
                "last_outbid": last_bid_on_this_listing,
                "message": "Bid Successfully entered!",
                "status": "success",
                "owner": owner,
                "isActive": isActive
            })

        else:
            return render(request, "auctions/listing_page_info.html", {
                "listing_info": listing_info,
                "ListingInUserWatchlist": ListingInUserWatchlist,
                "item_Comment": item_Comment,
                "user": user,
                "last_outbid": last_bid_on_this_listing,
                "message": "Your bid must outbid the last bid!",
                "status": "failed",
                "owner": owner,
                "isActive": isActive
            })

    else:
        if float(bid) >= float(listing_initial_price):

            actualBid = Bid(
                person = user,
                listing = listing_info,
                price = float(bid),
            )
            actualBid.save()

            last_bid_on_this_listing = Bid.objects.filter(listing=listing_info).last()

            return render(request, "auctions/listing_page_info.html", {
                "listing_info": listing_info,
                "ListingInUserWatchlist": ListingInUserWatchlist,
                "item_Comment": item_Comment,
                "user": user,
                "last_outbid": last_bid_on_this_listing,
                "message": "Bid Successfully entered!",
                "status": "success",
                "owner": owner,
                "isActive": isActive
            })
        
        else:
            last_bid_on_this_listing = Bid.objects.filter(listing=listing_info).last()
            return render(request, "auctions/listing_page_info.html", {
                "listing_info": listing_info,
                "ListingInUserWatchlist": ListingInUserWatchlist,
                "item_Comment": item_Comment,
                "user": user,
                "last_outbid": last_bid_on_this_listing,
                "message": "Your bid must outbid the initial Price!",
                "status": "failed",
                "owner": owner,
                "isActive": isActive
            })

