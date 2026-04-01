import { Platform, Alert } from 'react-native';
import { generatePDF as createPDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';

/**
 * Reusable utility to generate and share a PDF file globally across the app.
 * @param {string} htmlContent - The raw HTML string to compile into a PDF.
 * @param {string} fileNamePrefix - The base name for the generated file.
 */
export const generateAndSharePDF = async (htmlContent, fileNamePrefix = 'Report') => {
  try {
    const options = {
      html: htmlContent,
      fileName: fileNamePrefix,
    };

    const file = await createPDF(options);

    if (!file.filePath) {
      throw new Error('PDF path is null. Generation failed natively.');
    }

    const url = Platform.OS === 'android' && !file.filePath.startsWith('file://')
      ? 'file://' + file.filePath 
      : file.filePath;

    await Share.open({
       url,
       type: 'application/pdf',
       title: `Download ${fileNamePrefix}`,
       failOnCancel: false,
    });
  } catch (error) {
    if (error && (error.message === 'User did not share' || String(error).includes('User did not share'))) {
       return;
    }
    console.warn('PDF Error:', error);
    Alert.alert('Error', 'Failed to generate PDF. Make sure you rebuilt the app natively.');
  }
};
