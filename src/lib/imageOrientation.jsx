/**
 * Corrige a orientação da imagem baseada no EXIF
 * Usa exifr para ler metadados de orientação
 */
import exifr from "exifr";

export async function fixImageOrientation(file) {
  try {
    const orientationData = await exifr.parse(file, {
      tiff: { Orientation: true },
      exif: { Orientation: true },
      gps: false,
      ifd0: false,
    });
    
    const orientation = orientationData?.Orientation || 1;
    
    if (!orientation || orientation === 1) {
      return file;
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBlob = new Blob([arrayBuffer], { type: file.type });
    const objectUrl = URL.createObjectURL(imageBlob);

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        let width = img.width;
        let height = img.height;
        
        if (orientation === 6 || orientation === 8) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (orientation) {
          case 6:
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, 0, 0, width, height);
            break;
          case 8:
            ctx.translate(0, canvas.height);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(img, 0, 0, width, height);
            break;
          case 3:
            ctx.translate(canvas.width, canvas.height);
            ctx.rotate(Math.PI);
            ctx.drawImage(img, 0, 0, width, height);
            break;
          default:
            ctx.drawImage(img, 0, 0, width, height);
        }
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        }, "image/jpeg", 0.9);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      
      img.src = objectUrl;
    });
  } catch (error) {
    console.error("Erro ao corrigir orientação EXIF:", error);
    return file;
  }
}