const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => 
    blogs.reduce((sum, blog) => {
        if (typeof blog.likes !== 'undefined' && Number.isInteger(blog.likes)) return sum + blog.likes
        return sum
    }, 0)

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return NaN
    
    let max = blogs[0]
    blogs.forEach(blog => {
        if (blog.likes > max.likes) max = blog
    })

    return {title: max.title, author: max.author, likes: max.likes}
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return NaN
    
    let bloggers = new Map()

    blogs.forEach(blog => {
        if (bloggers.has(blog.author)) {
            bloggers.set(blog.author, bloggers.get(blog.author) + 1)
        } 
        else {
            bloggers.set(blog.author, 1)
        }
    })

    let bloggersArray = Array.from(bloggers.entries())
    
    let max = bloggersArray[0]
    bloggersArray.forEach(blogger => {
        if (blogger[1] > max[1]) max = blogger
    })

    return {author: max[0], blogs: max[1]}
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}