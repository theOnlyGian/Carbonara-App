from django.http import JsonResponse
from django.shortcuts import redirect, render
import json
from book.forms import MyUserCreationForm
from .models import *
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.conf import settings

def home(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.user.is_authenticated:
            user = request.user
            data = json.load(request)
            title = data['title']
            recipeUrl = data['recipeUrl']
            mealType = data['mealType']
            tempoStimato = data['tempoStimato']

            recipe = None
            try:
                recipe = Recipe.objects.get(
                    title=title, mealType=mealType, tempoStimato=tempoStimato)
            except:
                pass

            if recipe != None:
                print('This recipe is already in the database!')
            else:
                print('Adding to the database!')
                recipe = Recipe(title=title, recipeUrl=recipeUrl,
                                mealType=mealType, tempoStimato=tempoStimato)
                recipe.save()

            if len(user.recipes.all()) < 5:
                if user.recipes.filter(title=title).filter(recipeUrl=recipeUrl).filter(mealType=mealType).filter(tempoStimato=tempoStimato):
                    print("E' gia' nella tua lista!")
                    return JsonResponse({
                        'message': "E' gia' nella tua lista!",
                        'success': False
                    })
                else:
                    user.recipes.add(recipe)
                    return JsonResponse({
                        "message": "Aggiunto nella lista.",
                        'success': True
                    })
            else:
                return JsonResponse({
                    "message": "Puoi avere solo 5 piatti nella tua lista!",
                    'success': False
                })
        else:
            return JsonResponse({
                "message": "Devi essere registrato per aggiungerlo nella lista!",
            'success': False
            })

    if request.user.is_authenticated:
        loggedIn = True
    else:
        loggedIn = False
    return render(request, 'book/home.html', {
        'loggedIn': loggedIn
    })

@login_required(login_url='login')
def platesView(request):
    user = request.user
    try:
        data = json.load(request)
    except:
        pass

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == 'GET':
        plates = user.recipes.values().order_by('-id')
        list_result = [plate for plate in plates]
        # safe = false makes it accept other data types other than dicts
        return JsonResponse(list_result, safe=False)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == 'POST' and data:
        print('sto per eliminare il recipe')
        removeTitle = data['removeItem']
        recipeToBeRemoved = user.recipes.get(title=removeTitle)
        recipeToBeRemoved.delete()

        platesCount = len(user.recipes.all())
        return JsonResponse({
            'message': 'Ricetta eliminata correttamente.',
            'platesCount': platesCount
        })
    if request.user.is_authenticated:
        loggedIn = True
    else:
        loggedIn = False
    return render(request, 'book/plates.html', {
        'loggedIn': loggedIn
    })


def loginView(request):
    loginAccess = True
    context = {'login': loginAccess}
    if request.method == 'POST':
        username = request.POST.get('username').lower()
        password = request.POST.get('password')

        user = None
        try:
            user = authenticate(username=username, password=password)
        except:
            pass

        # Se l'utente esiste utente != none
        if user != None:
            login(request, user)
            return redirect('home')
        else:
            # Errore, password o username non corretti
            context['errorMessage'] = 'Username o password sbagliati.'
            return render(request, 'book/access.html', context)
    return render(request, 'book/access.html', context)


def registerView(request):
    registerAccess = True
    context = {'register': registerAccess}
    if request.method == 'POST':
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            return redirect('home')
        else:
            usernameInput = request.POST.get('username')
            password1Input = request.POST.get('password1')
            password2Input = request.POST.get('password2')
            
            if MyUser.objects.filter(username=usernameInput):
                context['errorMessage'] = "Username gia' esistente"

            elif len(usernameInput) < 8:
                context['errorMessage'] = "Il tuo username deve essere almeno di 8 caratteri."

            elif password1Input != password2Input:
                context['errorMessage'] = "Le due password non coincidono."

            elif len(password1Input) < 8:
                context['errorMessage'] = "La password deve essere almeno di 8 caratteri."
            
            else:
                context['errorMessage'] = "Password debole"
            # errore
            # Utente già esistente
            # Password debole
            # Lunghezza password
            # Password non coincidono
            return render(request, 'book/access.html', context)
    return render(request, 'book/access.html', context)


@login_required(login_url='login')
def logoutView(request):
    logout(request)
    loginAccess = True
    context = {'login': loginAccess}
    if request.method == 'POST':
        username = request.POST.get('username').lower()
        password = request.POST.get('password')

        user = None
        try:
            user = authenticate(username=username, password=password)
        except:
            pass

        # Se l'utente esiste utente != none
        if user != None:
            login(request, user)
            return redirect('home')
        else:
            # Errore, password o username non corretti
            context['errorMessage'] = 'Username o password sbagliati.'
            return render(request, 'book/access.html', context)

    context['successMessage'] = 'Disconesso '
    return render(request, 'book/access.html', context)
