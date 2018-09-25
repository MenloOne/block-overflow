/* eslint react/jsx-filename-extension: 0 */

import React from 'react'
import {mount} from 'enzyme'

import createFlux from 'flux/createFlux'
import I18nContainer from 'utils/i18n-container'

import ApiClient from '../../../shared/api-client'

export default (Component, props = {}, customfluxInstance) => {
  const client = new ApiClient()
  const flux = typeof customfluxInstance === 'object' ? customfluxInstance : createFlux(client)

  if (customfluxInstance === true) return flux

  /* istanbul ignore if */
  if (process.env.BROWSER) {
    const Cookies = require('cookies-js')

    if (Cookies.get('_lang')) {
      const {messages} = require(`data/${Cookies.get('_lang')}`)
      flux.getActions('locale').switchLocale({locale: Cookies.get('_lang'), messages})
    }
  }

  const wrapper = mount(
    <I18nContainer>
      <Component {...props} />
    </I18nContainer>,
    {context: {flux}},
  )

  return {flux, wrapper}
}
