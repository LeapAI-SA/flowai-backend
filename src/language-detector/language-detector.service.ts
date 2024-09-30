import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageDetectorService {
  detectLanguage(query: string): { code: string; name: string } {
    const filteredQuery = query.replace(/[0-9]/g, '');
    const arabicRegex = /[\u0600-\u06FF]/;
    const allNumbersRegex = /^[0-9]*$/;
    const englishRegex = /[A-Za-z]/;
    if (allNumbersRegex.test(filteredQuery)) {
      return { code: 'en', name: 'English' };
    }
    if (arabicRegex.test(filteredQuery)) {
      return { code: 'ar', name: 'Arabic' };
    } else {
      return { code: 'en', name: 'English' };
    }
  }
}
