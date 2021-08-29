const express= require('express');
const bodyParser=require('body-parser');
var app=express();
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
const passport=require('passport');
const authenticate=require('../authenticate');
const favoriteRouter= express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites)=>{
        if(favorites){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(favorites);
        }
        else{
            res.statusCode=200;
            res.setHeader('Content-Type','text/plain');
            res.end('Your favorite dishes are empty');
        }
    },(err)=>next(err))
    .catch((err)=>{
        next(err)
    });
})

.post(authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user: req.user._id})
    .then((favorites)=>{
        if(!favorites){
            Favorites.create({user: req.user._id})
            .then((favorites)=>{
                for(let k=0;k<req.body.length;k++){
                    favorites.dishes.push(req.body[k]._id);
                }
                console.log(favorites);        
                favorites.save()
                .then((err)=>{
                    res.statusCode=200;
                    res.setHeader('Conetent-Type','application/json');
                    res.json(favorites);
                },(err)=>next(err));
            },(err)=>next(err));            
        }
        else{
        for(let i=0;i<req.body.length;i++){
            var ab=req.body[i]._id;
            for(let j=0;j<favorites.dishes.length; j++){
                if(favorites.dishes[j]==ab){
                    res.statusCode=403;
                    res.setHeader('Content-Type','text/plain');
                    res.end('A Dish is already in your favorites');
                    return;
                }
            }
        }
        for(let k=0;k<req.body.length;k++){
            favorites.dishes.push(req.body[k]._id);
        }          
        favorites.save()
        .then((err)=>{
            res.statusCode=200;
            res.setHeader('Conetent-Type','application/json');
            res.json(favorites);
        },(err)=>next(err));
    }
    },(err)=>next(err))
    .catch((err)=>next(err));    
})
.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /favorites/');   
})
.delete(authenticate.verifyUser,(req,res,next)=>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});




favoriteRouter.route('/:dishId')

.get(authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user: req.user._id})
    .then((favorites)=>{

    })
})

.post(authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user: req.user._id})
    .then((favorites)=>{
    if(!favorites){
        console.log("first one");
        console.log(favorites);
        req.body.user=req.user._id;
        Favorites.create(req.body)
        .then((favorites)=>{
        favorites.dishes.push(req.params.dishId);
        favorites.save()
            .then((favorites)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favorites);

            },(err)=>next(err));
        },(err)=>next(err));
    }
    else{
        Favorites.findOne({user: req.user._id})
        .then((favor)=>{
            for(let j=0;j<favor.dishes.length; j++){
                if(favorites.dishes[j]==req.params.dishId){
                    res.statusCode=403;
                    res.setHeader('Content-Type','text/plain');
                    res.end('This Dish is already in your favorites');
                    return;
                }
                
            }
            favor.dishes.push(req.params.dishId);
            favor.save()
            .then((favor)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favor);

            },(err)=>next(err));
        },(err)=> next(err))
        .catch((err)=>next(err));
    }    
        
        
    },(err)=>next(err))
    .catch((err)=>next(err));
})

.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /favorites/'+ req.params.dishId);   
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    var ui=0;
    Favorites.findOne({user: req.user._id})
    .then((favorites)=>{
        if(favorites){
            for(let j=0;j<favorites.dishes.length; j++){
                if(favorites.dishes[j]==req.params.dishId){
                    console.log('I am HERE ! ');
                   

                    favorites.dishes.splice(j, 1);

                    favorites.save()
                    .then((favorites)=>{
                        res.statusCode=200;
                        ui=2;
                        res.setHeader('Content-Type','text/plain');
                        res.end(req.params.dishId + ' this Dish is removed from your favorites');
                    },(err)=>next(err));

                }
                else{
                    if(j==favorites.dishes.length-1){
                        var err= new Error('This dish is not in your favorites');
                        err.status=403;
                        next(err);
                    }
                }
            }

        }
        else{
            res.statusCode=403;
            res.setHeader('content-Type','text/plain');
            res.end(req.params.dishId + ' this Dish is not in your favorites');
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});
module.exports=favoriteRouter;