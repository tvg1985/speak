exports.convertAudioToAAC = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const bucket = admin.storage().bucket(object.bucket);
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const aacFilePath = `${tempFilePath}.aac`;

    await bucket.file(filePath).download({destination: tempFilePath});

    return new Promise((resolve, reject) => {
        ffmpeg(tempFilePath)
            .output(aacFilePath)
            .audioCodec('libfdk_aac') // Use the Fraunhofer FDK AAC codec
            .on('end', async () => {
                await bucket.upload(aacFilePath, {
                    destination: `${path.dirname(filePath)}/${path.basename(filePath)}.aac`,
                    metadata: {
                        contentType: 'audio/aac', // Set the correct MIME type
                    },
                });

                const file = bucket.file(`${path.dirname(filePath)}/${path.basename(filePath)}.aac`);

                await file.makePublic();

                fs.unlinkSync(tempFilePath);
                fs.unlinkSync(aacFilePath);
                resolve();
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            })
            .run();
    });
});