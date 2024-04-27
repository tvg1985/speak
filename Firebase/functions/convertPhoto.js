exports.onImageUpload = functions.storage.object().onFinalize(async (object) => {
    const bucket = admin.storage().bucket(object.bucket);
    const filePath = object.name;
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const tempFilePathJPEG = tempFilePath + '.jpeg';

    if (!object.contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }

    await bucket.file(filePath).download({destination: tempFilePath});

    await sharp(tempFilePath).jpeg().toFile(tempFilePathJPEG);

    await bucket.upload(tempFilePathJPEG, {
        destination: `${path.dirname(filePath)}/${fileName}.jpeg`,
        metadata: {
            contentType: 'image/jpeg',
        },
    });

    const file = bucket.file(`${path.dirname(filePath)}/${fileName}.jpeg`);

    await file.makePublic();

    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempFilePathJPEG);

    console.log('Image converted to JPEG');
    return null;
});