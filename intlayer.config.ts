import { type IntlayerConfig, Locales } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.CHINESE_TRADITIONAL, Locales.ENGLISH],
    defaultLocale: Locales.CHINESE_TRADITIONAL,
  },
};

export default config;
