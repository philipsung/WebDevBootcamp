var express = require("express"),
    router = express.Router({mergeParams: true});
    
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"); //automatically requires index.js

//COMMENTS NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
})

//COMMENT POST ROUTE
router.post("/", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            req.flash("error", "Something went wrong");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //Add user info to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment); 
                    campground.save(function(err,data){
                        if(err){
                            req.flash("error", "Something went wrong");
                            console.log(err);
                        } else {
                            req.flash("succes", "Comment added");
                        }
                    });
                }
            });
            
            
            
            res.redirect("/campgrounds/" + campground._id);
            
        }
    });
});

//COMMENT EDIT FORM
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log(err);
            res.redirect("back");
        } else
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    });
})

//COMMENT UPDATE
router.put("/:comment_id/", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       console.log(req.params.comment_id);
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);       
        }
    }) 
});


module.exports = router;