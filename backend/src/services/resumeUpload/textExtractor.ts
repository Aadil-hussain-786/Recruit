import mammoth from 'mammoth';
import { TextExtractionResult, ResumeFormat } from './types';

// Try to load pdf-parse with different approaches
let pdfParse: any;
try {
  const mod = require('pdf-parse');
  pdfParse = mod.default || mod;
} catch {
  try {
    const mod = require('pdf-parse/lib/pdf-parse.js');
    pdfParse = mod.default || mod;
  } catch {
    pdfParse = async (buffer: Buffer) => {
      throw new Error('pdf-parse module not available');
    };
  }
}

/**
 * TextExtractor - Extracts text from resume files in various formats
 */
export class TextExtractor {
  /**
   * Extract text from a file buffer
   */
  async extractText(buffer: Buffer, format: ResumeFormat): Promise<TextExtractionResult> {
    switch (format) {
      case 'pdf':
        return this.extractFromPdf(buffer);
      case 'doc':
      case 'docx':
        return this.extractFromDoc(buffer);
      case 'txt':
        return this.extractFromText(buffer);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Extract text with formatting information
   */
  async extractWithFormatting(buffer: Buffer, format: ResumeFormat): Promise<TextExtractionResult> {
    const result = await this.extractText(buffer, format);
    
    // Parse sections from extracted text
    const sections = this.parseSections(result.text);
    
    return {
      ...result,
      sections
    };
  }

  /**
   * Extract text from PDF
   */
  private async extractFromPdf(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text || '';
      
      return {
        text: text.trim(),
        wordCount: this.countWords(text)
      };
    } catch (error: any) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from Word documents
   */
  private async extractFromDoc(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      
      return {
        text: text.trim(),
        wordCount: this.countWords(text)
      };
    } catch (error: any) {
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text files
   */
  private extractFromText(buffer: Buffer): TextExtractionResult {
    const text = buffer.toString('utf-8').trim();
    
    return {
      text,
      wordCount: this.countWords(text)
    };
  }

  /**
   * Parse sections from resume text
   */
  private parseSections(text: string): TextExtractionResult['sections'] {
    const sections: TextExtractionResult['sections'] = {};
    
    // Common section headers in resumes
    const sectionPatterns: Record<string, RegExp[]> = {
      header: [
        /^(?:name|contact|email|phone|address)[:\s]*(.*)$/im,
        /^(?:[A-Z][a-z]+\s[A-Z][a-z]+)$/m  // Name pattern
      ],
      experience: [
        /(?:experience|work history|employment)[:\s]*(.*)$/im,
        /(?:\d{4})\s*[-–]\s*(?:present|current)/gi
      ],
      education: [
        /(?:education|academic|qualifications)[:\s]*(.*)$/im,
        /(?:bachelor|master|phd|degree|university|college)/gi
      ],
      skills: [
        /(?:skills|technical skills|competencies)[:\s]*(.*)$/im,
        /(?:javascript|python|react|node|sql|aws|docker|kubernetes)/gi
      ]
    };

    // Simple section extraction based on keywords
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('experience') || lowerText.includes('work history')) {
      sections.experience = this.extractSection(text, 'experience');
    }
    
    if (lowerText.includes('education') || lowerText.includes('academic')) {
      sections.education = this.extractSection(text, 'education');
    }
    
    if (lowerText.includes('skills') || lowerText.includes('technical skills')) {
      sections.skills = this.extractSection(text, 'skills');
    }

    return sections;
  }

  /**
   * Extract a specific section from text
   */
  private extractSection(text: string, sectionName: string): string {
    const sectionPatterns: Record<string, RegExp[]> = {
      experience: [
        /(?:experience|work history|employment)[:\s]*([\s\S]*?)(?=(?:education|skills|projects|$))/i,
        /([\s\S]{0,2000})/i
      ],
      education: [
        /(?:education|academic|qualifications)[:\s]*([\s\S]*?)(?=(?:experience|skills|projects|$))/i
      ],
      skills: [
        /(?:skills|technical skills|competencies)[:\s]*([\s\S]*?)(?=(?:experience|education|projects|$))/i
      ]
    };

    const patterns = sectionPatterns[sectionName] || [];
    
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}

export default TextExtractor;