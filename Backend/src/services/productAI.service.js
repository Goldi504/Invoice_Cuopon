const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const normalizeProductWithAI = async (
  externalProduct,
  barcode
) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn(
        "GROQ_API_KEY is missing. Skipping AI normalization."
      );

      return null;
    }

    // ==========================================
    // RAW PRODUCT DATA
    // ==========================================

    const productInformation = {
      barcode,

      title:
        externalProduct?.title || "",

      brand:
        externalProduct?.brand || "",

      model:
        externalProduct?.model || "",

      category:
        externalProduct?.category || "",

      description:
        externalProduct?.description || "",

      color:
        externalProduct?.color || "",

      size:
        externalProduct?.size || "",

      images:
        externalProduct?.images || [],

      offers:
        externalProduct?.offers || [],
    };

    // ==========================================
    // GROQ
    // ==========================================

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        temperature: 0,

        messages: [
          {
            role: "system",

            content: `
You are a product information extraction system
for a mobile shop management application.

You receive raw product information from a barcode
product database.

Your job is to extract and normalize the product
information.

Return ONLY valid JSON.

The JSON must have exactly these fields:

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

1. category must be either:
   "MOBILE"
   or
   "ACCESSORY"

2. Smartphone, mobile phone, iPhone,
   Android phone, feature phone:
   category = "MOBILE"

3. Charger, cable, earphone, headphone,
   mobile cover, case, screen protector,
   power bank, adapter, smartwatch and similar:
   category = "ACCESSORY"

4. Extract RAM only if the source data
   supports it.

5. Extract storage only if the source data
   supports it.

6. Extract color only if the source data
   supports it.

7. Never guess or invent specifications.

8. If information is unavailable,
   return an empty string.

9. Do not create purchase price.

10. Do not create selling price.

11. Keep the description short and useful.

12. Return JSON only.

13. Do not use markdown code blocks.

14. Do not add extra fields.
`,
          },

          {
            role: "user",

            content: JSON.stringify(
              productInformation,
              null,
              2
            ),
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

    // ==========================================
    // GET GROQ RESPONSE
    // ==========================================

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content) {
      console.warn(
        "Groq returned empty response."
      );

      return null;
    }

    console.log(
      "Groq raw response:",
      content
    );

    // ==========================================
    // PARSE JSON
    // ==========================================

    const parsedProduct =
      JSON.parse(content);

    // ==========================================
    // RETURN CLEAN DATA
    // ==========================================

    return {
      brand:
        parsedProduct.brand || "",

      model:
        parsedProduct.model || "",

      category:
        parsedProduct.category ===
        "ACCESSORY"
          ? "ACCESSORY"
          : "MOBILE",

      ram:
        parsedProduct.ram || "",

      storage:
        parsedProduct.storage || "",

      color:
        parsedProduct.color || "",

      description:
        parsedProduct.description || "",
    };
  } catch (error) {
    console.error(
      "Groq Product Normalization Error:",
      error?.message || error
    );

    return null;
  }
};

module.exports = {
  normalizeProductWithAI,
};