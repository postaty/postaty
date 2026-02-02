/**
 * Compress an image file to reduce size while maintaining quality
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 2,
  maxWidthOrHeight: number = 1920
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height && width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        } else if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }

        // Create canvas and draw image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels until we get under maxSizeMB
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              const sizeMB = blob.size / (1024 * 1024);

              // If still too large and quality can be reduced, try again
              if (sizeMB > maxSizeMB && quality > 0.5) {
                quality -= 0.1;
                tryCompress();
                return;
              }

              // Convert blob to base64
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
