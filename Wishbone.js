//Instruments scrip for Wishbone UITesting

var TestingEnv = function(target) {

  this.target = target
  this.window = target.frontMostApp().mainWindow()
  this.currentlyTesting = "Nothing"

}

//must use these to log starts and passes. The parser recognizes subtests based on the seperator, told how to organize the folder and the RunSummary.
TestingEnv.prototype.logStart = function(test, subtest) {

  if (typeof(subtest) === "undefined") {
    UIALogger.logStart(test)
  }

  else {
    UIALogger.logStart(test + " > " + subtest)
  }

}

//must accompany every logStart with a logPass, or else the parser will see it as a failed test
TestingEnv.prototype.logPass = function(test, subtest) {

  if (typeof(subtest) === "undefined") {
    UIALogger.logPass(test)
  }

  else {
    UIALogger.logPass(test + " > " + subtest)
  }

}

//must use this function to take a screenshot, parser knows how to organize folders by this funciton
TestingEnv.prototype.screenShot = function(options) {

  var default_args = {
    'test' : "Fail",
    'subtest' : "",
    'info' : ""
  }

  for(var index in default_args) {
		if(typeof options[index] == "undefined") options[index] = default_args[index];
	}

  var message = options["test"]

  if (options['subtest'] !== "") message = message + " > " + options['subtest']

  if (options['info'] !== "") message = message + " " + options['info']

  this.target.captureScreenWithName(message)

}

//FIRST SCREEN ------------------------------------------

TestingEnv.prototype.authenticateWithFacebook = function() {}

TestingEnv.prototype.authenticateWithTwitter = function() {}

TestingEnv.prototype.skipLogin = function() {

  this.logStart("First Screen", "Skip Login")
  this.window.buttons()["Skip Login"].tap()
  this.logPass("First Screen", "Skip Login")
}

TestingEnv.prototype.completeFirstScreen = function() {

  this.screenShot({
    'test' : "First Screen",
    'info' : (new Date()).toUTCString()
  })
  this.window.pageIndicators()[0].withValueForKey(1, "isVisible").selectPage(1)
  this.screenShot({
    'test' : "First Screen",
    'info' : (new Date()).toUTCString()
  })
  this.window.scrollViews()[0].withValueForKey(1, "isVisible").scrollViews()[0].buttons()[0].tap()

}

TestingEnv.prototype.completeFirstScreenWithLoginType = function(loginType) {

  UIALogger.logStart("First Screen")

  this.target.captureScreenWithName("First Screen " + (new Date()).toUTCString());

  switch (loginType) {

    case "Twitter":

      this.authenticateWithTwitter()

      break;

    case "Facebook":

      this.authenticateWithFacebook()

      break;

    case "Skip Login":

      this.skipLogin()

      break;

    default:

      break;
  }

  this.target.captureScreenWithName("First Screen " + (new Date()).toUTCString());

  this.completeFirstScreen()

  this.target.delay(2)

  UIALogger.logPass("First Screen")

}

//MAIN VIEW ------------------------------------------

TestingEnv.prototype.selectFeed = function(string) {

  this.logStart(this.currentlyTesting, "Select Feed")

  if (!this.window.staticTexts()[string].isValid()) {
    this.window.staticTexts()["Nightly Dozen"].tap()
  } else {
    this.window.staticTexts()[string].tap()
  }
  this.logPass(this.currentlyTesting, "Select Feed")
}

TestingEnv.prototype.voteOnCell = function(n) {

  this.target.pushTimeout(10)

  this.target.delay(2)

  var choice = Math.floor((Math.random() * 2))

  var tableView = this.window.tableViews()[1]

  var suceeded = true

  this.screenShot({

    'test' : this.currentlyTesting,
    'info' : "Card " + n.toString() + " Unvoted"

  })

  try {

    tableView.cells()[n].tapWithOptions({
      tapOffset: {
        x: choice === 0 ? 0.25 : 0.75,
        y: 0.5
      }
    })

  } catch (error) {

    suceeded = false

    var hasConqueredAd = false

    this.logStart(this.currentlyTesting, "Ad")

    var now = new Date()

    this.window.logElementTree()

    //wait for video to play
    UIALogger.logMessage("Waiting for video to play T-30s")

    this.target.delay(30)

    this.screenShot({

      'test' : this.currentlyTesting,
      'subtest' : "Ad",
      'info' : "at index " + n.toString()

    })

    //tap a number of known buttons
    UIALogger.logMessage(this.window.buttons())
    for (button in this.window.buttons) {
      UIALogger.logMessage(button.isVisible)
    }
    if (this.window.buttons()["vg close"].checkIsValid()) {
      UIALogger.logMessage("Tapping T L")
      this.target.tap({
        x: 15,
        y: 10
      })
    } else if (this.window.buttons()["MPCloseButtonX"].withValueForKey(1, "isVisible").checkIsValid()) {
      this.window.buttons()["MPCloseButtonX"].tap()
    } else if (this.window.buttons()["Close Interstitial Ad"].withValueForKey(1, "isVisible").checkIsValid()) {
      this.window.buttons()["Close Interstitial Ad"].tap()
    }  else if (this.window.elements()["Close Advertisement"].withValueForKey(1, "isVisible").checkIsValid()) {
      this.window.elements()["Close Advertisement"].tap()
    } else if (this.window.buttons()["Cancel"].withValueForKey(1, true).checkIsValid()) {
      this.window.buttons()["Cancel"].tap()
    } else if (this.window.buttons()[4].withValueForKey(1, "isVisible").checkIsValid()) {
      UIALogger.logMessage("Tap button 4")
      this.window.buttons()[4].tap()
    } else if (this.window.buttons()[3].withValueForKey(1, "isVisible").isValid()) {
      UIALogger.logMessage("Tap button 3")
      this.window.buttons()[3].tap()
    }

    hasConqueredAd = true

    try {
      this.window.tableViews()[1].cells()[n].tapWithOptions({
        tapOffset: {
          x: choice === 0 ? 0.25 : 0.75,
          y: 0.5
        }
      })
    } catch (error) {
      hasConqueredAd = false
    } finally {
      this.target.logElementTree()
      if (hasConqueredAd) {
        this.logPass(this.currentlyTesting, "Ad")
        this.target.delay(0.5)
        this.screenShot({

          'test' : this.currentlyTesting,
          'info' : "Card " + n.toString() + " Voted"

        })
        return
      }
    }

    //tap top right
    var screenWidth = this.target.rect().size.width
    UIALogger.logMessage("Tapping T R")
    this.target.tap({
      x: screenWidth - 20,
      y: 10
    })

    this.target.delay(2)

    hasConqueredAd = true

    try {
      this.window.tableViews()[1].cells()[n].tapWithOptions({
        tapOffset: {
          x: choice === 0 ? 0.25 : 0.75,
          y: 0.5
        }
      })
    } catch (error) {
      hasConqueredAd = false
    } finally {
      this.target.logElementTree()
      if (hasConqueredAd) {
        this.logPass(this.currentlyTesting, "Ad")
        this.target.delay(0.5)
        this.screenShot({

          'test' : this.currentlyTesting,
          'info' : "Card " + n.toString() + " Voted"

        })
        return
      }
    }

    //try tapping top left
    UIALogger.logMessage("Tapping T L")
    this.target.tap({
      x: 15,
      y: 10
    })

    this.target.delay(2)

    hasConqueredAd = true

    this.target.delay(2)

    try {
      this.window.tableViews()[1].cells()[n].tapWithOptions({
        tapOffset: {
          x: choice === 0 ? 0.25 : 0.75,
          y: 0.5
        }
      })
    } catch (error) {
      hasConqueredAd = false
    } finally {
      this.target.logElementTree()
      if (hasConqueredAd) {
        this.logPass(this.currentlyTesting, "Ad")
        this.target.delay(0.5)
        this.screenShot({

          'test' : this.currentlyTesting,
          'info' : "Card " + n.toString() + " Voted"

        })
        return
      } else {
        UIALogger.logFail("Ad")
      }
    }


  } finally {
    UIALogger.logMessage("Tested cell " + n.toString())

    if (suceeded == true) {
      this.target.delay(0.5)
      this.screenShot({

        'test' : this.currentlyTesting,
        'info' : "Card " + n.toString() + " Voted"

      })
    }
  }

}

TestingEnv.prototype.completeDailyDozen = function() {


  this.window.logElementTree()

  this.currentlyTesting = "Daily Dozen"

  UIALogger.logStart("Daily Dozen")

  this.selectFeed("Daily Dozen")

  this.target.delay(5)

  var numberOfElements = this.window.elements().length

  for (i = 0; i < 12; i++) {

    if (i !== 12) {
      this.voteOnCell(i)
    }

  }

  this.target.delay(2)

  //this.window.buttons()["Done"].withValueForKey(1, "isVisible").tap()

  UIALogger.logPass("Daily Dozen")

}

TestingEnv.prototype.completeCommunity = function() {

  this.currentlyTesting = "Community"

  this.window.logElementTree()

  UIALogger.logStart("Community")

  this.selectFeed("Community")

  this.target.delay(5)

  var numberOfElements = this.window.elements().length

  for (i = 0; i < 50; i++) {

    this.voteOnCell(i)

  }

  UIALogger.logPass("Community")
}

TestingEnv.prototype.shareNow = function() {}

TestingEnv.prototype.completeShareThemView = function() {}

TestingEnv.prototype.shareCard = function() {}

//DROP DOWN MENU ------------------------------------------

//depricated v-3.0.6
TestingEnv.prototype.selectSettings = function() {

  this.window.buttons()["new gear icon"].tap()

}

//depricated v-3.0.6
TestingEnv.prototype.loginFromSettings = function() {

  this.window.buttons()["Login"].tap()

}

//depricated v-3.0.6
TestingEnv.prototype.exitFromSettings = function() {

  this.window.buttons()["Close"].withValueForKey(1, "isVisible").tap()

}

//depricated v-3.0.6
TestingEnv.prototype.restorePurchases = function() {

  this.window.buttons()["Restore Purchases"].withValueForKey(1, "isVisible").tap()
  this.target.delay(2)
}

//depricated v-3.0.6
TestingEnv.prototype.selectCreateNew = function() {

  this.window.buttons()["create new mywb"].withValueForKey(1, "isVisible").tap()

}

TestingEnv.prototype.selectAboutWishbone = function() {

  UIALogger.logMessage("Select About Wishbone from dropdown menu")
  this.window.tableViews().firstWithPredicate("value like 'rows 1 to 5 of 5'").withValueForKey(1, "isVisible").cells()[2].tap()
}

TestingEnv.prototype.selectShareWithAFriend = function() {

  this.window.tableViews().firstWithPredicate("value like 'rows 1 to 5 of 5'").withValueForKey(1, "isVisible").cells()[3].tap()

}

TestingEnv.prototype.selectContactUs = function() {

  this.logStart("Menu", "Contact Us")

  this.target.pushTimeout(10)

  this.window.tableViews().firstWithPredicate("value like 'rows 1 to 5 of 5'").withValueForKey(1, "isVisible").cells()[4].tap()

  this.target.captureScreenWithName("Menu " + (new Date()).toUTCString());

  this.window.navigationBars()[0].buttons()["Send"].withValueForKey(1, "isVisible").tap()

  this.logPass("Menu", "Contact Us")
}

TestingEnv.prototype.selectFindFriends = function() {
  this.logStart("Menu", "Find Friends")
  this.target.pushTimeout(10)
  this.window.tableViews().firstWithPredicate("value like 'rows 1 to 5 of 5'").withValueForKey(1, "isVisible").cells()[1].tap()
  this.target.delay(5)
  this.screenShot({'test' : "Menu",'subtest' : "Find Friends",'info' : (new Date()).toUTCString() })
  this.window.tableViews()[0].searchBars()[0].withValueForKey(1, "isVisible").tap()
  this.target.frontMostApp().keyboard().withValueForKey(1, "isVisible").typeString("Abc\n")
  this.target.delay(2)
  this.screenShot({'test' : "Menu",'subtest' : "Find Friends",'info' : (new Date()).toUTCString() })
  this.window.tableViews()[0].cells()[0].withValueForKey(1, "isVisible").tap()
  this.target.delay(5)
  this.screenShot({'test' : "Menu",'subtest' : "Find Friends",'info' : (new Date()).toUTCString() })
  this.window.tableViews()[0].buttons()["follow"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "Find Friends",'info' : (new Date()).toUTCString() })
  this.window.buttons()["create back"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "Find Friends",'info' : (new Date()).toUTCString() })
  this.window.buttons()["create close"].withValueForKey(1, "isVisible").tap()
  this.logPass("Menu", "Find Friends")
}

TestingEnv.prototype.closeMenu = function() {

  this.window.buttons()["create close"].withValueForKey(1, "isVisible").tap()
  this.target.captureScreenWithName("Menu " + (new Date()).toUTCString());
}

TestingEnv.prototype.selectMyWishbones = function() {

  this.logStart("Menu", "My Wishbones")

  this.window.tableViews().firstWithPredicate("value like 'rows 1 to 5 of 5'").withValueForKey(1, "isVisible").cells()[0].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.window.tableViews()[0].buttons()["edit profile"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })

  this.window.scrollViews()[0].buttons()["Edit"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.chooseFromLibrary()
  this.window.scrollViews()[0].textFields()[4].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.target.frontMostApp().actionSheet().collectionViews()[0].cells()["Male"].buttons()["Male"].withValueForKey(1, "isVisible").tap();
  this.window.scrollViews()[0].textFields()[5].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.target.logElementTree()
  var tabBarWindow
  var pickerViewWindow

  this.target.pushTimeout(0)

  for (i = 0; i < this.target.frontMostApp().windows().length; i++) {
    UIALogger.logMessage("index " + i.toString())
    if (this.target.frontMostApp().windows()[i].toolbars().length !== 0) {
      tabBarWindow = this.target.frontMostApp().windows()[i]
    }

    if (this.target.frontMostApp().windows()[i].pickers().length !== 0) {
      pickerViewWindow = this.target.frontMostApp().windows()[i]
    }

  }

  this.target.popTimeout()
  pickerViewWindow.pickers()[0].wheels()[0].selectValue("January")
  pickerViewWindow.pickers()[0].wheels()[1].selectValue("1")
  pickerViewWindow.pickers()[0].wheels()[2].selectValue("2015")
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  tabBarWindow.toolbar().buttons()["Done"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.window.scrollViews()[0].textFields()[2].tap()
  this.target.frontMostApp().keyboard().typeString("wtobey@science-inc.com")
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.window.buttons()["Done"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Menu",'subtest' : "My Wishbones",'info' : (new Date()).toUTCString() })
  this.closeMenu()
  this.logPass("Menu", "My Wishbones")

}

TestingEnv.prototype.dropMenu = function() {

  this.target.tap({x:16.50, y:26.50})

}

TestingEnv.prototype.testEntireMenu = function() {

  UIALogger.logStart("Menu")

  this.target.pushTimeout(10)
  this.target.delay(5)
  this.dropMenu()
  this.target.delay(5)
  this.selectMyWishbones()
  this.target.delay(2)
  this.dropMenu()
  this.selectFindFriends()
  this.target.delay(2)
  this.dropMenu()
  this.selectAboutWishbone()
  this.closeMenu()
  //this.dropMenu()
  //this.selectContactUs()

  UIALogger.logPass("Menu")

}

//CREATE ------------------------------------------

TestingEnv.prototype.enterCreateWithPlus = function() {

  this.window.buttons()[0].withValueForKey(1, "isVisible").tap()
  this.target.captureScreenWithName("Create View " + (new Date()).toUTCString());
}

TestingEnv.prototype.enterCreateThroughMyWishbones = function() {}

TestingEnv.prototype.enterQuestion = function() {

  this.window.textViews()[0].withValueForKey(1, "isVisible").tap()

  this.target.frontMostApp().keyboard().typeString("Test Post")

  this.window.tapWithOptions({
      x: 0.5,
      y: 0.5
  })

}

TestingEnv.prototype.enterImage = function(oneOrTwo) {

  this.window.buttons()[oneOrTwo].withValueForKey(1, "isVisible").tap()
  this.target.captureScreenWithName("Create View " + (new Date()).toUTCString());
}

TestingEnv.prototype.takePhoto = function() {

  this.logStart("Create View", "Take Photo")

  this.window.buttons()["Take Photo"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Create View",'subtest' : "Take Photo",'info' : (new Date()).toUTCString() })
  this.window.buttons()["PhotoCapture"].withValueForKey(1, "isVisible").tap()
  this.window.buttons()["Use Photo"].withValueForKey(1, "isVisible").tap()
  if (this.window.buttons()["Ok red"].isValid()) {
    this.screenShot({'test' : "Create View",'info' : (new Date()).toUTCString() })
    this.window.buttons()["Ok red"].tap()
    this.target.delay(5)
  }

  this.logPass("Create View", "Take Photo")

}

TestingEnv.prototype.chooseFromLibrary = function() {

  this.logStart("Create View", "Choose From Library")

  this.window.buttons()["Choose from library"].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Create View",'subtest' : "Choose From Library",'info' : (new Date()).toUTCString() })
  this.window.tableViews()[0].cells()[0].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Create View",'subtest' : "Choose From Library",'info' : (new Date()).toUTCString() })
  this.window.collectionViews()[0].visibleCells()[0].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Create View",'subtest' : "Choose From Library",'info' : (new Date()).toUTCString() })
  if (this.window.buttons()["Ok red"].isValid()) {
    this.screenShot({'test' : "Create View",'info' : (new Date()).toUTCString() })
    this.window.buttons()["Ok red"].tap()
    this.target.delay(5)
  }

  this.logPass("Create View", "Choose From Library")

}

TestingEnv.prototype.searchWeb = function() {

  this.logStart("Create View", "Search Web")

  this.window.buttons()["Search Web"].tap()
  this.screenShot({'test' : "Create View",'subtest' : "Search Web",'info' : (new Date()).toUTCString() })
  this.target.frontMostApp().keyboard().typeString("Cat\n")
  this.screenShot({'test' : "Create View",'subtest' : "Search Web",'info' : (new Date()).toUTCString() })
  this.window.collectionViews()[0].cells()[0].withValueForKey(1, "isVisible").tap()
  if (this.window.buttons()["Ok red"].isValid()) {
    this.screenShot({'test' : "Create View", 'info' : (new Date()).toUTCString() })
    this.window.buttons()["Ok red"].tap()
    this.target.delay(5)
  }

  this.logPass("Create View", "Search Web")

}

TestingEnv.prototype.addSticker = function() {

  this.logStart("Create View", "Add Sticker")
  this.window.images()["add-sticker.png"].withValueForKey(1, "isVisible").tap()
  this.window.collectionViews()[0].cells()[0].withValueForKey(1, "isVisible").tap()
  this.screenShot({'test' : "Create View",'subtest' : "Add Sticker",'info' : (new Date()).toUTCString() })

  if (this.window.buttons()["Ok red"].isValid()) {
    this.screenShot({'test' : "Create View",'info' : (new Date()).toUTCString() })
    this.window.buttons()["Ok red"].tap()
    this.target.delay(5)
  }
  this.logPass("Create View", "Add Sticker")
}

TestingEnv.prototype.submitPost = function() {

  this.window.buttons()["create close"].tap()
  this.target.captureScreenWithName("Create View " + (new Date()).toUTCString());
}

TestingEnv.prototype.submitQuestion = function() {

  this.target.captureScreenWithName("Create View " + (new Date()).toUTCString());
  this.window.buttons()["Done"].tap()

}

TestingEnv.prototype.handleWishboneCreatedScreen = function() {

  this.window.buttons()["create share done"].tap()
  this.target.captureScreenWithName("Create View " + (new Date()).toUTCString());

}

TestingEnv.prototype.testCreateView = function() {

  UIALogger.logStart("Create View")

  this.target.pushTimeout(10)
  this.enterCreateWithPlus()
  this.enterQuestion()
  this.enterImage(1)
  this.searchWeb()
  this.enterImage(1)
  this.addSticker()
  this.enterImage(2)
  this.chooseFromLibrary()
  this.submitQuestion()
  this.handleWishboneCreatedScreen()

  UIALogger.logPass("Create View")

}

//MAIN ------------------------------------------

var target = UIATarget.localTarget();

var newEnv = new TestingEnv(target)

newEnv.target.setTimeout(10)
newEnv.target.delay(2)
newEnv.completeFirstScreenWithLoginType("Skip Login")
newEnv.testCreateView()
newEnv.target.logElementTree()
newEnv.testEntireMenu()
newEnv.completeCommunity()
newEnv.completeDailyDozen()
