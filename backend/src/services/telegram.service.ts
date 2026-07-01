import axios from 'axios';
import { config } from '../config';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${config.telegram.botToken}`;

/**
 * Sends a text message to a specific Telegram chat/channel.
 * @param text The message text (MarkdownV2 or HTML supported if specified)
 * @param chatId The target chat ID, defaults to the configured channel ID
 */
export const sendMessageToChannel = async (text: string, chatId: string = config.telegram.channelId) => {
  if (!config.telegram.botToken || !chatId) {
    console.warn('Telegram bot token or channel ID is missing.');
    return;
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    console.error('Failed to send Telegram message:', error?.response?.data || error.message);
  }
};

/**
 * Gets a file URL from Telegram's file_id
 */
export const getTelegramFileUrl = async (fileId: string): Promise<string | null> => {
  if (!config.telegram.botToken) return null;

  try {
    const res = await axios.post(`${TELEGRAM_API_URL}/getFile`, { file_id: fileId });
    const filePath = res.data?.result?.file_path;
    if (!filePath) return null;
    return `https://api.telegram.org/file/bot${config.telegram.botToken}/${filePath}`;
  } catch (error) {
    console.error('Failed to get Telegram file URL:', error);
    return null;
  }
};
