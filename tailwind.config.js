const tinycolor = require('tinycolor2')
const defaultTheme = require('tailwindcss/defaultTheme')

function alphaVariants(color) {
  let c = color;
  let tc = tinycolor(c);

  function alphaVariants(prefix) {
    let r = {}
    r[prefix + '0.2'] = tc.setAlpha(0.2).toRgbString()
    r[prefix + '0.4'] = tc.setAlpha(0.4).toRgbString()
    r[prefix + '0.6'] = tc.setAlpha(0.6).toRgbString()
    r[prefix + '0.8'] = tc.setAlpha(0.8).toRgbString()
    return r;
  }

  return {
    default: c,
    ...alphaVariants('')
  }
}

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [ "./src/**/*.svelte", "./src/**/*.html" ],
  theme: {
    fontFamily: {
      main: [
        'bariolregular',
        ...defaultTheme.fontFamily.sans
      ],
      brand: [
        'plan9regular',
        ...defaultTheme.fontFamily.sans
      ],
      mono: [
        ...defaultTheme.fontFamily.mono
      ]
    },
    palete: {
      black: '#303030',
      white: '#cfcfcf',
      blue: '#3080cf',
      dark: '#2E3A59',
      'dark-lest': '#DEE8F6',
      'dark-less': '#91A5CD',
      'dark-more': '#172040',
      'dark-most': '#080E2A',
      light: '#ffd666',
      'light-lest': '#7A5313',
      'light-less': '#B78C33',
      'light-more': '#FFEBA3',
      'light-most': '#FFFAE0',
    },
    colors: theme => ({
      black: theme('palete.black'),
      white: alphaVariants(theme('palete.white')),
      dark: alphaVariants(theme('palete.dark')),
      // 'dark-lest': alphaVariants(theme('palete.dark-lest')),
      // 'dark-less': alphaVariants(theme('palete.dark-less')),
      // 'dark-more': alphaVariants(theme('palete.dark-more')),
      // 'dark-most': alphaVariants(theme('palete.dark-most')),
      light: alphaVariants(theme('palete.light')),
      // 'light-lest': alphaVariants(theme('palete.light-lest')),
      // 'light-less': alphaVariants(theme('palete.light-less')),
      // 'light-more': alphaVariants(theme('palete.light-more')),
      // 'light-most': alphaVariants(theme('palete.light-most')),
      transparent: 'rgba(0, 0, 0, 0)',
    }),
    flexGrow: {
      default: 1,
      '0.2': 0.2,
      '0.4': 0.4,
      '0.6': 0.6,
      '0.8': 0.8,
      '2': 2,
      '3': 3,
      '4': 4,
    },
    minHeight: theme => theme('height'),
    extend: {
      minHeight: {
        '2px': '2px',
      },
      width: {
        'slide': '1200px'
      },
      height: {
        'slide': '900px'
      }
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
