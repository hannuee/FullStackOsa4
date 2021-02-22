const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const logger = require('../utils/logger')

const initialBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
      }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('All blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('Name of identifying property of a blog is called id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})


test('Blog addition succeeds', async () => {
    const newBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    const contents = response.body.map(r => r.title)
    expect(contents).toContain("Canonical string reduction")
})

test('Blog gets zero likes if likes missing', async () => {
    const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
      }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const response = await api.get('/api/blogs')

    const newBlogFromDB = response.body.find(b => b.title === "First class tests")
    expect(newBlogFromDB.likes).toBeDefined()
    expect(newBlogFromDB.likes).toBe(0)
})

test('Blog addition gets status code 400 if title missing', async () => {
    const newBlog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10
      }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('Blog addition gets status code 400 if url missing', async () => {
    const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        likes: 10
      }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('Blog addition gets status code 400 if title and url missing', async () => {
    const newBlog = {
        author: "Robert C. Martin",
        likes: 10
      }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})


afterAll(() => {
    mongoose.connection.close()
})
