/* eslint no-unused-expressions: 0 */

import test from 'ava'

import chai, {expect} from 'chai'
import chaiEnzyme from 'chai-enzyme'
import sinonChai from 'sinon-chai'

import LangPicker from 'components/shared/lang-picker'

import mount from './helpers/mount'

chai.use(sinonChai)
chai.use(chaiEnzyme())

test('it should have `en` locale active', () => {
  const {wrapper} = mount(LangPicker, {activeLocale: 'en'})
  expect(wrapper.find('.active')).to.have.text('en')
})
