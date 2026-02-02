"use server";

import { generateText } from "ai";
import { gateway } from "@/lib/ai";
import { getSystemPrompt, buildUserMessage } from "@/lib/prompts";
import { FORMAT_CONFIGS } from "@/lib/constants";
import type { PostFormData, GenerationResult } from "@/lib/types";

function getImages(data: PostFormData): string[] {
  const images: string[] = [];
  switch (data.category) {
    case "restaurant":
      images.push(data.mealImage, data.logo);
      break;
    case "supermarket":
      images.push(...data.productImages, data.logo);
      break;
    case "online":
      images.push(data.productImage, data.logo);
      break;
  }
  return images;
}

function getBusinessName(data: PostFormData): string {
  switch (data.category) {
    case "restaurant":
      return data.restaurantName;
    case "supermarket":
      return data.supermarketName;
    case "online":
      return data.shopName;
  }
}

function getProductName(data: PostFormData): string {
  switch (data.category) {
    case "restaurant":
      return data.mealName;
    case "supermarket":
      return data.productName;
    case "online":
      return data.productName;
  }
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

export async function generatePoster(
  data: PostFormData
): Promise<{
  results: GenerationResult[];
  prompt: string;
  businessName: string;
  productName: string;
}> {
  // Step 1: Craft the image generation prompt using GPT-4o
  const systemPrompt = getSystemPrompt(data.category);
  const userMessage = buildUserMessage(data);

  const { text: craftedPrompt } = await generateText({
    model: gateway("openai/gpt-4o"),
    system: systemPrompt,
    prompt: userMessage,
  });

  // Step 2: Prepare input images as buffers
  const inputImageBuffers = getImages(data).map(dataUrlToBuffer);

  const results: GenerationResult[] = [];

  for (const format of data.formats) {
    const config = FORMAT_CONFIGS[format];

    try {
      // Use Gemini 3 Pro (multimodal LLM) which accepts input images
      // and can generate images using generateText
      const result = await generateText({
        model: gateway("google/gemini-3-pro-image"),
        messages: [
          {
            role: "user",
            content: [
              // Pass all uploaded images
              ...inputImageBuffers.map((buf) => ({
                type: "image" as const,
                image: buf,
              })),
              // Pass the crafted prompt with format instructions
              {
                type: "text" as const,
                text: `Using the provided images (product/meal photo and logo), create a professional ${config.aspectRatio} social media marketing poster.\n\n${craftedPrompt}\n\nIMPORTANT: Use the EXACT uploaded images in the poster - the meal/product photo and the logo. Do NOT generate new food images. The poster should have the aspect ratio ${config.aspectRatio}. Generate ONLY the image, no text response.`,
              },
            ],
          },
        ],
      });

      // Gemini returns images in result.files
      const imageFile = result.files?.find((f) =>
        f.mediaType?.startsWith("image/")
      );

      if (imageFile) {
        const base64 = Buffer.from(imageFile.uint8Array).toString("base64");
        results.push({
          format,
          imageBase64: base64,
          status: "complete",
        });
      } else {
        results.push({
          format,
          imageBase64: "",
          status: "error",
          error: "لم يتم إنشاء صورة من النموذج",
        });
      }
    } catch (error) {
      console.error(`Error generating image for ${format}:`, error);
      results.push({
        format,
        imageBase64: "",
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ في إنشاء الصورة",
      });
    }
  }

  return {
    results,
    prompt: craftedPrompt,
    businessName: getBusinessName(data),
    productName: getProductName(data),
  };
}
