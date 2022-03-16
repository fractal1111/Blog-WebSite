
const blogModel = require("../models/blogModel")


//..................................................................................................
const createBlog = async function (req, res) {
  try {

    let data = req.body;

    if (data) {
      if (req.body.authorId == req.decodedToken.authId) {


        let unPublishedBlog = await blogModel.create(data);


        if (data.isPublished === true) {

          let publishedBlog = await blogModel.findOneAndUpdate({ _id: unPublishedBlog._id },

            { $set: { publishedAt: Date.now() } }, { new: true })

          return res.status(201).send({ PublishedBlog: publishedBlog })
        }
        return res.status(201).send({ UnPublishedBlog: unPublishedBlog });

      }

      else {return res.status(403).send({ ERROR: "Only the logged in author can create there blog" }) }
    }
    else {return res.status(400).send({ ERROR: "BAD REQUEST" }) }



  } catch (err) {
    return res.status(500).send({ ERROR: err.message })
  }
}


//..........................................................................................................

const getBlog = async function (req, res) {
  try {

    const data = req.query

    const filter = { isDeleted: false, isPublished: true, $and: [data] }

    const blog = await blogModel.find(filter)
    if (blog.length === 0) {
      return res.status(404).send({ status: false, ERROR: "No blogs found according to the query" })
    }
    return res.status(200).send({ status: true, Blogs: blog })
  }

  catch (err) {
    return res.status(500).send({ERROR: err.message})
  }
}




// update..........................................................................................



const updateBlog = async function (req, res) {
  try {

    let blogId = req.params.blogId
    let data = req.body
    let blogToBeModified = await blogModel.findById(blogId)
    if (blogToBeModified) {

      if (blogToBeModified.authorId == req.decodedToken.authId) {


        if (Object.keys(data) != 0) {

          if (blogToBeModified.isDeleted == false) {

            if (data.isPublished === true) {
              let blogToBePublished = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isPublished: true, publishedAt: Date.now() } })
            }

            let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { ...data }, { new: true })

            return res.status(202).send({ Status: "Blog updated successfully", updatedBlog })

          }
          else {
            return res.status(400).send({ ERROR: "Blog requested has been deleted" })
          }
        }
        else {
          return res.status(400).send({ ERROR: "Bad Request" })
        }


      } else {return res.status(403).send({ ERROR: "Author is not authorized to update requested blog" }) }


    } else {return res.status(404).send({ ERROR: "Blog not found" }) }
  }

  catch (err) {
    return res.status(500).send({ ERROR: err.message })
  }

}


// delete by id ...........................................................................................

let deleteBlogById = async function (req, res) {

  try {
    let id = req.params.blogId

    if (id) {
      let blogToBeDeleted = await blogModel.findById(id)
      if (blogToBeDeleted) {
             if (blogToBeDeleted.authorId == req.decodedToken.authId) {


                 let deletedBlog = await blogModel.findOneAndUpdate({ _id: id },
                         { $set: { isDeleted: true, deletedAt: Date.now() } })

                         return res.status(200).send({ Status: "Requested blog has been deleted." })

              } else {return res.status(403).send({ ERROR: "Author is not authorised to delete requested blog" }) }


      } else {return res.status(404).send({ ERROR: "Blog to be deleted not found" }) }

    } else{ return res.status(400).send({ ERROR: 'BAD REQUEST' })}


  }
  catch (err) {return res.status(500).send({ERROR : err.message }) }


}


//delete by query params......................................................................................

let deletedByQueryParams = async function (req, res) {
  try {

    let data = req.query
    if (Object.keys(data) != 0) {

      let getBlogs = await blogModel.find(data).select({ authorId: 1, _id: 1 })
    
      if (getBlogs.length != 0) {

        let blogsToBeDeleted = getBlogs.filter(function (el) { return el.authorId == req.decodedToken.authId })
     
        if (blogsToBeDeleted != 0) {


          let deletedBlogs = await blogModel.updateMany({ _id: { $in: blogsToBeDeleted } },
            { $set: { isDeleted: true, deletedAt: Date.now() } })
     
            return res.status(200).send("Requested blog has been deleted")

        } else {return res.status(403).send({ ERROR: "The author is not authorised to delete the requested blogs" }) }




      } else { return res.status(404).send({ ERROR: "No Blogs were found" }) }

    } else {return res.status(400).send({ ERROR: "Please provide queries" }) }

  }
  catch (err) {return res.status(500).send({ ERROR: err.message }) }


}





module.exports.createBlog = createBlog
module.exports.getBlog = getBlog
module.exports.updateBlog = updateBlog
module.exports.deleteBlogById = deleteBlogById
module.exports.deletedByQueryParams = deletedByQueryParams


