const mongoose = require('mongoose')
const Campground = require('../models/campground')
const { cities } = require('./cities')
const { places, descriptors } = require('./seedHelper')
console.log("city", cities[0])

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

const sample = (array) => array[Math.floor(Math.random() * array.length)]

dbSeed = async () => {
    console.log(cities[0].city)
    console.log("descriptor", descriptors[0])
    await Campground.deleteMany({})
    console.log("deleted all db items")
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus animi delectus unde omnis iure repellat reprehenderit blanditiis veritatis recusandae nesciunt est distinctio mollitia, eos voluptatum exercitationem natus nostrum. Minima, molestiae.'
        const location = `${cities[random1000].city}, ${cities[random1000].state}`
        const image = 'https://source.unsplash.com/collection/483251'
        const title = `${sample(descriptors)} ${sample(places)}`
        const campground = new Campground({ title, location, description, price, image })
        await campground.save()
    }

    //const camp = new Campground({ title: "second", description: "second des" })
    //await camp.save()
}

dbSeed().then(() => {
    mongoose.connection.close()
})

