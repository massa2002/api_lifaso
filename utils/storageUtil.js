const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid');

const storage = new Storage({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
  projectId: 'vente-cafc7',
});

const bucket = storage.bucket('vente-cafc7.appspot.com');

async function uploadImageToStorage(file) {
  const blob = bucket.file(`${uuid.v4()}-${file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    }).on('error', (err) => {
      reject(err);
    }).end(file.buffer);
  });
}

async function uploadSurveyImageToStorage(file) {
  // 🔹 Stocke l'image dans un dossier "photos"
  const folderName = 'photos'; // Nom du dossier dans Firebase Storage
  const blob = bucket.file(`${folderName}/${uuid.v4()}-${file.originalname}`);
  
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    }).on('error', (err) => {
      reject(err);
    }).end(file.buffer);
  });
}

module.exports = { uploadImageToStorage , uploadSurveyImageToStorage};