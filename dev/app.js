const express = require('express')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const { campgroundSchema } = require('./schemas')
const { reviewSchema } = require('./schemas')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.log.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected ")
})

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}


const app = express()
const path = require('path')
const { required } = require('joi')


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_METHOD'))

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campground/index', { campgrounds })
}))
app.get('/campgrounds/create', (req, res) => {
    res.render('campground/create')
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campground/update', { camp })

}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews')
    res.render('campground/show', { camp })
}))



app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    res.redirect(`/campgrounds/${req.params.id}`)
}))


app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    //console.log("here")
    //console.log("body", req.body)
    //const { title, location } = req.body
    const camp = new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${campground._id}`)
    //res.send("done")
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    console.log("in delete")
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.get('/', (req, res) => {
    //res.send("hello world")
    res.render('index')
})

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong!'
    res.status(statusCode).render('error', { err })

})

app.listen(3000, () => {
    console.log("listening on port 3000")
})