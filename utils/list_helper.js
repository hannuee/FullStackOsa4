const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => blogs.reduce((sum, blog) => {
    if (typeof blog.likes !== 'undefined' && Number.isInteger(blog.likes)) return sum + blog.likes
    return sum
}, 0)
  
module.exports = {
    dummy,
    totalLikes
}