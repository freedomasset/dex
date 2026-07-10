import { style } from '@vanilla-extract/css'

import { sprinkles, vars } from './sprinkles.css'

// TYPOGRAPHY
export const headlineMedium = sprinkles({ fontWeight: 'medium', fontSize: '28', lineHeight: '36' })

export const subhead = sprinkles({ fontWeight: 'book', fontSize: '16', lineHeight: '24' })

export const body = sprinkles({ fontWeight: 'book', fontSize: '16', lineHeight: '24' })
export const bodySmall = sprinkles({ fontWeight: 'book', fontSize: '14', lineHeight: '20' })

export const lightGrayOverlayOnHover = style([
  sprinkles({
    transition: '250',
  }),
  {
    ':hover': {
      background: vars.color.lightGrayOverlay,
    },
  },
])
