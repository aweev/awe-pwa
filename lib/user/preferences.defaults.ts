import type { PreferencesInput } from './preferences.types';

export const PREFERENCES_DEFAULTS: PreferencesInput = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  marketingEmails: false,
  newsletterSubscription: true,

  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',

  profileVisibility: 'public',
  showEmail: false,
  showPhoneNumber: false,
  showLocation: true,

  contentLanguage: ['en'],
  contentTopics: [],

  notificationSettings: {},
};

