import { type IntlayerConfig, Locales } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.CHINESE_TAIWAN, Locales.ENGLISH],
    defaultLocale: Locales.CHINESE_TAIWAN,
  },
};

export default config;
