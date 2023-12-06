class APIFeatures {
    constructor(query,queryString){
      this.query = query
      this.queryString = queryString
    }
  
    filter(){
  //1A) Filtering
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      const queryObj = {...this.queryString}
      const excludedFields = ['page','sort','fields','limit']
      excludedFields.forEach(x => delete queryObj[x])
  
      
  
      
  //1B) Advanced Filtering
      let queryStr = JSON.stringify(queryObj)
      queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g,match=>`$${match}`)
      
     this.query = this.query.find(JSON.parse(queryStr))
     return this
    }
  
    sort(){
  //2) Sorting
  if(this.queryString.sort){
    const sortBy = this.queryString.sort.split(",").join(" ")
    this.query = this.query.sort(sortBy)
  }else{
    this.query = this.query.sort('-createdAt')
  }
  return this
    }
  
    limitField(){
      if(this.queryString.fields){
        const fields = this.queryString.fields.split(',').join(' ')
        this.query = this.query.select(fields)
      }
      else{
        this.query = this.query.select("-__v")
      }
      return this
    }
  
    paginate(){
      const limit = this.queryString.limit * 1 || 100
      const skip = (this.queryString.page * 1 || 1 - 1) * limit 
      this.query = this.query.skip(skip).limit(limit)
      
    
      return this
    }
  
  }
  module.exports = APIFeatures