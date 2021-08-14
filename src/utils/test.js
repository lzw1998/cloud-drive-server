// import imagemin from "imagemin";
// import imageminMozjpeg from "imagemin-mozjpeg";
// import imageminPngquant from "imagemin-pngquant";
import { resolve } from "path";

// (async () => {
//   try {
//     const inputPath = resolve("./cloud-drive-server/src/target/files");
//     const outputPath = resolve("./cloud-drive-server/src/target/thumbnail");
//     console.log(inputPath, outputPath);

//     const files = await imagemin([`${inputPath}/*.{jpg,png}`], {
//       destination: outputPath,
//       plugins: [
//         imageminMozjpeg({
//           quality: 25,
//         }),
//         imageminPngquant({
//           quality: [0.2, 0.25],
//         }),
//       ],
//     });

//     console.log(files);
//   } catch (error) {
//     console.log(error);
//   }

//   //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
// })();

import Jimp from "jimp";

const inputPath = resolve("./cloud-drive-server/src/target/files");
const outputPath = resolve("./cloud-drive-server/src/target/thumbnail");
Jimp.read(`${inputPath}/xingyun0001-16mb`, (err, lenna) => {
  if (err) throw err;
  console.log(lenna)
  lenna
    .resize(256, 256) // resize
    .quality(60) // set JPEG quality
    .write(`${outputPath}/output.png`); // save
});
