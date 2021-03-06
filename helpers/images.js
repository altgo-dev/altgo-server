/* istanbul ignore file */
'use strict'

require('dotenv').config()
const Storage = require('@google-cloud/storage')
const CLOUD_BUCKET = process.env.CLOUD_BUCKET

const storage = Storage({
  projectId: process.env.GCLOUD_PROJECT,
  keyFilename: process.env.KEYFILE_PATH
})
let bucket = null

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`
}


const sendUploadToGCS = (req, res, next) => {
  if (!req.file) {
    return next()
  }

  bucket = bucket || storage.bucket(CLOUD_BUCKET)
  req.file.originalname = req.file.originalname.split(' ').join('_')
  const gcsname = Date.now() + req.file.originalname
  const file = bucket.file(gcsname)
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  })

  stream.on('error', (err) => {
    req.file.cloudStorageError = err
    next(err)
  })

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
      next()
    })
  })
  stream.end(req.file.buffer)
}

const Multer = require('multer'),
  multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
      fieldSize: 2 * 1024 * 1024
    }
  })

module.exports = {
  getPublicUrl,
  sendUploadToGCS,
  multer
}