const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/*
============================================================
NORMALIZE PRODUCT FROM OCR
============================================================
*/

const normalizeProductFromOCR = async ({
  barcode = "",
  ocrText = "",
}) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error(
        "GROQ_API_KEY is missing in .env"
      );

      return null;
    }

    if (!ocrText || !ocrText.trim()) {
      console.log(
        "OCR text is empty. Skipping Groq."
      );

      return null;
    }

    console.log(
      "========================================"
    );

    console.log(
      "Sending OCR data to Groq..."
    );

    console.log(
      "OCR Text:",
      ocrText
    );

    console.log(
      "Barcode:",
      barcode || "Not detected"
    );

    console.log(
      "========================================"
    );

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        temperature: 0,

        messages: [
          {
            role: "system",

            content: `
You are a product information extraction system
for a mobile phone shop management application.

The user provides OCR text captured from a mobile
phone/product label.

Your task is to extract the product information.

Return ONLY valid JSON.

The JSON MUST contain exactly these fields:

{
  "brand": "",
  "model": "",
  "category": "MOBILE",
  "ram": "",
  "storage": "",
  "color": "",
  "description": ""
}

IMPORTANT RULES:

1. category must be exactly:
   "MOBILE"
   or
   "ACCESSORY"

2. If the product is a smartphone/mobile phone,
   category must be "MOBILE".

3. If the product is a charger, cable, earphone,
   headphone, mobile cover, case, adapter,
   power bank, smartwatch, etc.,
   category must be "ACCESSORY".

4. Extract the brand if it is present.

5. Extract the exact product model if possible.

6. A model number such as:
   24090RA29I
   may be a model identifier.

7. Do NOT treat an IMEI number as the model.

8. Extract RAM only if it is supported by the
   OCR text or clearly identifiable.

9. Extract storage/ROM only if it is supported
   by the OCR text or clearly identifiable.

10. Extract color only if available.

11. Never invent RAM.

12. Never invent storage.

13. Never invent color.

14. Never invent price.

15. Never invent purchase price.

16. Never invent selling price.

17. Never invent IMEI.

18. Never invent warranty.

19. If information is unavailable,
    return an empty string.

20. Keep description short and useful.

21. Return JSON only.

22. Do not return markdown.

23. Do not add extra fields.
`,
          },

          {
            role: "user",

            content: JSON.stringify({
              barcode,
              ocrText,
            }),
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

    const content =
      completion?.choices?.[0]?.message?.content;

    if (!content) {
      console.error(
        "Groq returned an empty response."
      );

      return null;
    }

    console.log(
      "Groq Raw Response:",
      content
    );

    let parsedProduct;

    try {
      parsedProduct =
        JSON.parse(content);
    } catch (parseError) {
      console.error(
        "Groq JSON Parse Error:",
        parseError.message
      );

      return null;
    }

    const normalizedProduct = {
      brand:
        parsedProduct.brand
          ?.toString()
          .trim() || "",

      model:
        parsedProduct.model
          ?.toString()
          .trim() || "",

      category:
        parsedProduct.category ===
        "ACCESSORY"
          ? "ACCESSORY"
          : "MOBILE",

      ram:
        parsedProduct.ram
          ?.toString()
          .trim() || "",

      storage:
        parsedProduct.storage
          ?.toString()
          .trim() || "",

      color:
        parsedProduct.color
          ?.toString()
          .trim() || "",

      description:
        parsedProduct.description
          ?.toString()
          .trim() || "",
    };

    console.log(
      "Normalized Product:",
      normalizedProduct
    );

    return normalizedProduct;
  } catch (error) {
    console.error(
      "Groq Product Normalization Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    return null;
  }
};

/*
============================================================
EXPORT
============================================================
*/

module.exports = {
  normalizeProductFromOCR,
};