import express = require('express');


const logger = (req: express.Request, res: express.Response, next: express.NextFunction) => {

  const url = req.url
  const method = req.method
  const date = new Date().toLocaleDateString()
  const time = new Date().toLocaleTimeString()

  // Check if the request URL starts with '/css' or '/images'
  if(req.url.startsWith('/css') || req.url.startsWith('/images')){

    // Skip logging for requests targeting the public directory
    next()
  }else{

    let result: string = `${method} request for ${url} at ${time} - ${date}`

    console.log(result)
  
    next()
  }
}

export default logger