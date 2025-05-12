import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async chat(query: string, imageUrl?: string): Promise<string> {
    // Convert image URL to Base64 if provided
    let base64Image: string | undefined;
    if (imageUrl) {
      base64Image = await this.imageUrlToBase64(imageUrl);
    }

    const fullPrompt = base64Image
      ? `Analyze this image: ${base64Image}\n\nQuestion: ${query}`
      : query;

    const answer = await this.callDeepSeekAPI(fullPrompt);

    // Save chat record in the database
    await this.prisma.chat.create({
      data: {
        prompt: query,
        imageUrl: imageUrl || null,
        response: answer,
      },
    });

    return answer;
  }

  private async callDeepSeekAPI(query: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'user',
              content: query,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Log the full response to verify the structure
      console.log('OpenRouter API Response:', response.data);

      // Check if the response has 'choices' and the expected structure
      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Unexpected response format from OpenRouter API');
      }
    } catch (error) {
      console.error(
        'OpenRouter API error:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to fetch answer from OpenRouter');
    }
  }

  // Function to convert image URL to Base64
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const contentType = response.headers['content-type']; // e.g., image/png

      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error("Error in converting image URL to base64:", error);
      throw new Error("Image conversion failed");
    }
  }
}
