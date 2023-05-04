const Post = require("../model/Post")
const { User } = require("../model/User")
const jwt = require("jsonwebtoken")
const jwtSecret = require("./jwtVariables")

// crée un post en bd en lien avec l'user connecté
exports.createPost = async (req, res, next) => {
    const { url } = req.body
    const token = req.cookies.jwt


    if (token) {
            //on decode le token afin de recuperer l'utilisateur authentifié
            jwt.verify(token, jwtSecret, (err, decodedToken) => {
                if(err){
                    res.status(401).json({ message: "token error" })
                } 
                else {
                    userId = decodedToken.id
                }
            })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }

    //on cherche l'user en bd
    try{
        author = await User.findById(userId)
    }
    catch(err){
        res.status(400).json({
            message: "could not find user",
            error: err.message
        })
    }
    //TODO: set posted a true
    if(author){
        if(!author.posted){
            try{
                try{
                    //author.posted = true
                    author.save()
                }
                catch(err){
                    res.status(400).json({
                        message: "could not save posting status",
                        error: err.message
                    })
                }
                await Post.create({
                    author: author.id,
                    url,
                })

                res.status(201).json({
                    message: "post successfully created"
                })
            }
            catch (err){
                try{
                    //author.posted = false
                    author.save()
                }
                catch(err){
                    res.status(400).json({
                        message: "could not save posting status",
                        error: err.message
                    })
                }

                res.status(400).json({
                    message: "could not create post",
                    error: err.message
                })
            }
        }
        else{
            res.status(400).json({
                message: "user has already posted today"
            })
        }
    }
    else{
        res.status(400).json({
            message: "user not found"
        })
    }
}

// delete le post d'id 'postId'
exports.deletePost = async (req, res, next) => {
    const { postId } = req.body
    await Post.findByIdAndDelete(postId)
        .then(post =>{
            if(post){
                res.status(200).json({ message: "post deleted successfully", post})
            }
            else{
                res.status(400).json({
                    message: "no such post"
                })
            }
        })
        .catch(err =>
            res.status(400).json({
                message: "post could not be deleted",
                error: err.message
            }))
}

exports.getPost = async (req, res, next) => {
    const token = req.cookies.jwt
    const { postId } = req.body
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                //on cherche l'user en bd puis on cherche lele post
                User.findById(decodedToken.id).then((user) => {
                    if(decodedToken.role !== "admin"){
                        Post.findOne({
                            author: {$in: [user.friends, user] },
                            _id: postId
                        })
                        .then((post) => {
                            res.status(200).json({message: "post successfully fetched", post })
                        })
                        .catch((err) => {
                            res.status(400).json({message: "error while fetching post", error: err.message })
                        })
                }
                else{
                    Post.findById(postId).then((post) => res.status(200).json({ message: "post successfully fetched", post }))
                        .catch((err) => res.status(400).json({message: "error while fetching posts", error: err.message }))
                }
                })
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}

exports.getFriendPosts = async (req, res, next) => {
    const token = req.cookies.jwt
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                //on cherche l'user en bd puis on cherche dans les posts de ses amis et les siens que l'on tri par date (du plus recent au plus ancien)
                User.findById(decodedToken.id).then((user) => {
                    Post.find({
                        author: {$in: [user.friends, user] }
                        //TODO ne fetch que les posts au dela de la date de la derniere notification
                    })
                    .sort([['date', -1]])
                    .then((posts) => {
                        console.log(posts)
                        res.status(200).json({message: "posts successfully fetched", posts })
                    })
                    .catch((err) => {
                        res.status(400).json({message: "error while fetching posts", error: err.message })
                    })
                })
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}