var express = require("express"),
    router = express.Router();
    
var Campground = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware = require("../middleware"); //automatically requires index.js


router.get("/", function(req,res){
    //Get campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
})

router.post("/", middleware.isLoggedIn, function(req,res){
    //get data from form
    var name            = req.body.campName,
        image           = req.body.campImage,
        description     = req.body.description,
        newCampground   = {name: name, 
                            image:image, 
                            description: description,
                            author: {id: req.user._id,
                                    username: req.user.username
                            }
        };
        
    //add data to campgrounds array
    Campground.create(newCampground, function(err, newCamp){
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    })
})

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
})

//SHOW ROUTE - more info about particular campground
router.get("/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render template with campground info
            res.render("campgrounds/show", {campground: foundCampground});
        }
    })
})



// EDIT CAMPGROUND ROUTE
//check if user is logged in
router.get("/:id/edit", function(req, res){
    if(req.isAuthenticated()){
        //check if user is owner of campground
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err);
            }
            if(foundCampground.author.id.equals(req.user._id)) {
                res.render("campgrounds/edit", {campground: foundCampground});    
            } else {
                res.send("Not authorised");
            }

        });    
    } else {
        res.send("Please log in");
    }
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",function(req, res){
    // find and update the correct campground
    Campground.findOneAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//DELETE CAMPGROUND ROUTE
router.delete("/:id", function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/campgrounds");
    })
});

module.exports = router;