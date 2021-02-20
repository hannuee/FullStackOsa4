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
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}