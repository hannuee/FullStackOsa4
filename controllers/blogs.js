const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)

    // Blog gets zero likes if likes missing:
    if(!blog.likes) blog.likes = 0

    // Blog addition gets status code 400 if title and/or url missing:
    if (!blog.title || !blog.url) return response.status(400).end()

    const allUsers = await User.find({})
    oneUser = allUsers[0]
    blog.user = oneUser._id  

    const savedBlog = await blog.save()
    oneUser.blogs = oneUser.blogs.concat(savedBlog._id)
    await oneUser.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    // Blog gets zero likes if likes missing:
    if(!request.body.likes) request.body.likes = 0

    // Blog modification gets status code 400 if title and/or url missing:
    if (!request.body.title || !request.body.url) return response.status(400).end()

    const blog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter