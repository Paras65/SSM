import { describe, it, expect } from 'vitest';
import {
  cleanIndianPhone,
  generateAdmissionWhatsAppUrl,
  generateFeeReminderWhatsAppUrl,
  generateAttendanceAlertWhatsAppUrl,
  generateSchoolOnboardingWhatsAppUrl
} from '../utils/whatsapp';
import { generateRichDemoData } from '../utils/demoDataSeeder';
import { generateFullBackupJSON, parseAndValidateBackupJSON } from '../utils/backupExport';
import { extractYouTubeEmbedInfo, isValidYouTubeChannelUrl, formatYouTubeChannelUrl } from '../utils/youtube';
import type { School } from '../types';

describe('Pitching & Field-Ready Utilities Suite', () => {
  describe('WhatsApp Utilities (Direct wa.me)', () => {
    it('cleans Indian phone numbers with various formats', () => {
      expect(cleanIndianPhone('9876543210')).toBe('919876543210');
      expect(cleanIndianPhone('+91 98765 43210')).toBe('919876543210');
      expect(cleanIndianPhone('098765-43210')).toBe('919876543210');
      expect(cleanIndianPhone('12345')).toBeNull();
      expect(cleanIndianPhone('')).toBeNull();
    });

    it('generates direct WhatsApp URL for admission inquiries', () => {
      const url = generateAdmissionWhatsAppUrl(
        '9876543210',
        'आर्यन शर्मा',
        'Class 6',
        'सरस्वती शिशु मंदिर पक्का बाग',
        'गोरखपुर'
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain(encodeURIComponent('आर्यन शर्मा'));
      expect(url).toContain(encodeURIComponent('Class 6'));
    });

    it('generates direct WhatsApp URL for fee reminders', () => {
      const url = generateFeeReminderWhatsAppUrl(
        '9876543210',
        'अनन्या वर्मा',
        'Class 8',
        'मार्च 2026',
        1200,
        'गोरखपुर'
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain(encodeURIComponent('1200'));
      expect(url).toContain(encodeURIComponent('मार्च 2026'));
    });

    it('generates direct WhatsApp URL for attendance alerts', () => {
      const url = generateAttendanceAlertWhatsAppUrl(
        '9876543210',
        'देवांश मिश्र',
        'Class 9',
        '2026-03-25',
        'Absent',
        'गोरखपुर'
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain(encodeURIComponent('अनुपस्थित (Absent)'));
    });

    it('generates direct WhatsApp URL for school onboarding welcome and credentials', () => {
      const url = generateSchoolOnboardingWhatsAppUrl(
        '9876543210',
        'सरस्वती शिशु मंदिर माधव नगर',
        'लखनऊ',
        'आचार्य सतीश गुप्त',
        '1952',
        'VB-UP-2026-088',
        true
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain(encodeURIComponent('सरस्वती शिशु मंदिर माधव नगर'));
      expect(url).toContain(encodeURIComponent('1952'));
      expect(url).toContain(encodeURIComponent('15-दिवसीय पूर्ण निःशुल्क प्रो ट्रायल'));
    });
  });

  describe('Demo Data Seeder for Live Demos', () => {
    it('generates exactly 12 authentic students across grades with full metadata', () => {
      const demo = generateRichDemoData('test-ssm', 'वाराणसी');
      expect(demo.students.length).toBe(12);
      expect(demo.attendanceRecords.length).toBe(12);
      expect(demo.feeRecords.length).toBe(12);
      expect(demo.reportCards.length).toBe(12);
      expect(demo.notices.length).toBe(3);

      // Verify authentic cultural names & prefixes
      const hasBhaiya = demo.students.some(s => s.name.startsWith('भैया '));
      const hasBahin = demo.students.some(s => s.name.startsWith('बहिन '));
      expect(hasBhaiya).toBe(true);
      expect(hasBahin).toBe(true);

      // Verify NEP 2020 5 Pillars in report cards
      const rep = demo.reportCards[0];
      expect(rep.panchmukhiEvaluation).toBeDefined();
      expect(rep.panchmukhiEvaluation?.sharirik.grade).toBe('A+');
      expect(rep.panchmukhiEvaluation?.yog.grade).toBe('A+');
      expect(rep.panchmukhiEvaluation?.sangeet.grade).toBe('A');
      expect(rep.panchmukhiEvaluation?.sanskrit.grade).toBe('A+');
      expect(rep.panchmukhiEvaluation?.naitik.grade).toBe('A+');
    });
  });

  describe('Full School Backup Utility', () => {
    it('exports all school collections into valid JSON string with integrity check', () => {
      const mockSchool: School = {
        id: 'sch-101',
        name: 'Saraswati Shishu Mandir',
        hindiName: 'सरस्वती शिशु मंदिर',
        tagline: 'सा विद्या या विमुक्तये',
        affiliate: 'Vidya Bharati',
        affiliationNo: 'VB-UP-101',
        established: '1985',
        address: 'शास्त्री नगर',
        city: 'गोरखपुर',
        state: 'उत्तर प्रदेश',
        prant: 'गोरक्ष प्रान्त',
        phone: '0551-220011',
        email: 'ssm@vidyabharti.org',
        timings: '08:00 AM - 02:00 PM',
        principalName: 'श्री राम शरण जी',
        adminPasscode: '1234',
        plan: 'pro'
      };

      const demo = generateRichDemoData(mockSchool.id, mockSchool.city);
      const json = generateFullBackupJSON(
        mockSchool,
        demo.students,
        demo.feeRecords,
        demo.attendanceRecords,
        demo.reportCards,
        demo.notices
      );

      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.backupVersion).toBe('SSM-ERP-V1.0');
      expect(parsed.school.id).toBe('sch-101');
      expect(parsed.counts.students).toBe(12);
      expect(parsed.counts.fees).toBe(12);
      expect(parsed.counts.reportCards).toBe(12);
      expect(parsed.counts.notices).toBe(3);
    });

    it('parses and validates valid backup JSON payload successfully', () => {
      const mockSchool: School = {
        id: 'sch-restore-1',
        name: 'Saraswati Vidya Mandir',
        hindiName: 'सरस्वती विद्या मंदिर',
        tagline: 'सा विद्या या विमुक्तये',
        affiliate: 'Vidya Bharati',
        affiliationNo: 'VB-DL-01',
        established: '1990',
        address: 'केशव कुंज',
        city: 'नई दिल्ली',
        state: 'दिल्ली',
        prant: 'दिल्ली प्रान्त',
        phone: '011-2350011',
        email: 'svm@vidyabharti.org',
        timings: '08:00 AM - 02:00 PM',
        principalName: 'श्री आलोक जी',
        adminPasscode: '1234',
        plan: 'pro'
      };

      const demo = generateRichDemoData(mockSchool.id, mockSchool.city);
      const json = generateFullBackupJSON(
        mockSchool,
        demo.students,
        demo.feeRecords,
        demo.attendanceRecords,
        demo.reportCards,
        demo.notices
      );

      const restoreResult = parseAndValidateBackupJSON(json);
      expect(restoreResult.backupVersion).toBe('SSM-ERP-V1.0');
      expect(restoreResult.school.id).toBe('sch-restore-1');
      expect(restoreResult.data.students.length).toBe(12);
      expect(restoreResult.data.fees.length).toBe(12);
      expect(restoreResult.data.attendance.length).toBe(12);
      expect(restoreResult.data.reportCards.length).toBe(12);
      expect(restoreResult.data.notices.length).toBe(3);
    });

    it('throws descriptive errors for corrupted or invalid backup JSON', () => {
      // Invalid JSON syntax
      expect(() => parseAndValidateBackupJSON('{ bad json')).toThrow('अमान्य JSON प्रारूप');

      // Invalid backup version / missing identifier
      expect(() => parseAndValidateBackupJSON(JSON.stringify({ someData: 123 }))).toThrow('अमान्य बैकअप संस्करण');

      // Missing data payload or missing students array
      expect(() => parseAndValidateBackupJSON(JSON.stringify({
        backupVersion: 'SSM-ERP-V1.0',
        school: { id: 'sch-1' },
        data: {}
      }))).toThrow('बैकअप फ़ाइल में अनिवार्य संग्रह');
    });
  });

  describe('YouTube Integration Utilities (DPDP Privacy-Friendly)', () => {
    it('extracts embed info from standard watch URL', () => {
      const info = extractYouTubeEmbedInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(info.isValid).toBe(true);
      expect(info.videoId).toBe('dQw4w9WgXcQ');
      expect(info.isPlaylist).toBe(false);
      expect(info.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');
      expect(info.thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('extracts embed info from short share URL (youtu.be)', () => {
      const info = extractYouTubeEmbedInfo('https://youtu.be/dQw4w9WgXcQ?si=abcdef123');
      expect(info.isValid).toBe(true);
      expect(info.videoId).toBe('dQw4w9WgXcQ');
      expect(info.isPlaylist).toBe(false);
      expect(info.embedUrl).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('extracts embed info from YouTube Shorts URL', () => {
      const info = extractYouTubeEmbedInfo('https://www.youtube.com/shorts/dQw4w9WgXcQ');
      expect(info.isValid).toBe(true);
      expect(info.videoId).toBe('dQw4w9WgXcQ');
      expect(info.isPlaylist).toBe(false);
      expect(info.embedUrl).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('extracts embed info from YouTube Playlist URL', () => {
      const info = extractYouTubeEmbedInfo('https://www.youtube.com/playlist?list=PLr6-Sj5Z1b2n6ABCDEF');
      expect(info.isValid).toBe(true);
      expect(info.isPlaylist).toBe(true);
      expect(info.playlistId).toBe('PLr6-Sj5Z1b2n6ABCDEF');
      expect(info.embedUrl).toBe('https://www.youtube-nocookie.com/embed/videoseries?list=PLr6-Sj5Z1b2n6ABCDEF&rel=0&modestbranding=1');
    });

    it('handles invalid or non-YouTube URLs gracefully', () => {
      const invalidUrl = extractYouTubeEmbedInfo('https://google.com');
      expect(invalidUrl.isValid).toBe(false);
      expect(invalidUrl.embedUrl).toBeNull();

      const emptyUrl = extractYouTubeEmbedInfo('');
      expect(emptyUrl.isValid).toBe(false);
      expect(emptyUrl.embedUrl).toBeNull();
    });

    it('validates official YouTube channel URLs properly', () => {
      expect(isValidYouTubeChannelUrl('https://www.youtube.com/@ssmgorakhpur')).toBe(true);
      expect(isValidYouTubeChannelUrl('https://youtube.com/channel/UC1234567890abcdef')).toBe(true);
      expect(isValidYouTubeChannelUrl('https://youtube.com/c/vidyabharti')).toBe(true);
      expect(isValidYouTubeChannelUrl('https://youtube.com/user/vidyabharti')).toBe(true);
      expect(isValidYouTubeChannelUrl('@ssmgorakhpur')).toBe(true);

      expect(isValidYouTubeChannelUrl('https://facebook.com/ssm')).toBe(false);
      expect(isValidYouTubeChannelUrl('https://youtube.com/watch?v=123')).toBe(false);
      expect(isValidYouTubeChannelUrl('')).toBe(false);
    });

    it('formats clean channel URL for direct redirection', () => {
      expect(formatYouTubeChannelUrl('@ssmgorakhpur')).toBe('https://www.youtube.com/@ssmgorakhpur');
      expect(formatYouTubeChannelUrl('https://youtube.com/@vidyabharti')).toBe('https://youtube.com/@vidyabharti');
      expect(formatYouTubeChannelUrl('')).toBe('');
    });
  });
});
