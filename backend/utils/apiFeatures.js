class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;       // product.find
        this.queryStr=queryStr; //req.query
    }

    search(){
        const keyword=this.queryStr.keyword ?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i"
            }
        }:{};
        this.query=this.query.find({...keyword});
        return this
    }

    filter(){
        const queryCopy={...this.queryStr};
        // Removing some fields for category
        const removeFields=["keyword","page","limit"];
        removeFields.forEach(ele=>delete queryCopy[ele]);
        // filter for price and rating
        let queryStr=JSON.stringify(queryCopy)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(ele)=>`$${ele}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this
    }

    pagination(resPerPage){
        const currentPage=Number(this.queryStr.page)||1;
        const skip=resPerPage*(currentPage-1);
        this.query=this.query.limit(resPerPage).skip(skip)
        return this
    }
}

module.exports=ApiFeatures