const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
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

test('Blog deletion succeeds', async () => {
    const response = await api.get('/api/blogs')

    await api
        .delete(`/api/blogs/${response.body[0].id}`)
        .expect(204)
    
    const responseAfterDeletion = await api.get('/api/blogs')
    expect(responseAfterDeletion.body).toHaveLength(initialBlogs.length - 1)
})

test('Blog modification succeeds', async () => {
    const response = await api.get('/api/blogs')
    toBeModifiedBlog = response.body[0]

    toBeModifiedBlog.likes += 10

    await api
        .put(`/api/blogs/${toBeModifiedBlog.id}`)
        .send(toBeModifiedBlog)
        .expect(200)
    
    const responseAfterModification = await api.get('/api/blogs')
    expect(responseAfterModification.body).toHaveLength(initialBlogs.length)
    const modifiedBlogFromDB = responseAfterModification.body.find(b => b.id === toBeModifiedBlog.id)
    expect(modifiedBlogFromDB.likes).toBe(toBeModifiedBlog.likes)
})


describe('User addition error tests:', () => {

    const usersInDb = async () => {
        const users = await User.find({})
        return users.map(u => u.toJSON())
    }

    beforeEach(async () => {
        await User.deleteMany({})
    
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'SanMar', name: "Sanna", passwordHash })
    
        await user.save()
    })
    
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await usersInDb()
  
      const newUser = {
        username: 'SanMar',
        name: 'Sanna2',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` to be unique')
  
      const usersAtEnd = await usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username too short', async () => {
        const usersAtStart = await usersInDb()
    
        const newUser = {
          username: 'Sa',
          name: 'Sanna2',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('is shorter than the minimum allowed length')
    
        const usersAtEnd = await usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })
  
      test('creation fails with proper statuscode and message if password too short', async () => {
          const usersAtStart = await usersInDb()
      
          const newUser = {
            username: 'SannaMar',
            name: 'Sanna',
            password: 'sa',
          }
      
          const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
      
          expect(result.body.error).toContain('Password must be at least 3 characters')
      
          const usersAtEnd = await usersInDb()
          expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
})


afterAll(() => {
    mongoose.connection.close()
})
