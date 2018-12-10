import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { mount } from 'enzyme';
import SubmissionBanner from './SubmissionBanner';
import PubSub from 'pubsub-js';
Enzyme.configure({ adapter: new Adapter() });


describe('SubmissionBanner', () => {
  it('component is hidden if no submission', async () => {
    const wrapper = await mount(<SubmissionBanner/>);
    expect(wrapper.html()).toEqual('<div></div>');
  });
  it('renders submission if data received', async() => {

    const wrapper = await mount(<SubmissionBanner/>);
    PubSub.publishSync('submission', {
      submission: true,
      message: 'test'
    });
    expect(wrapper.html())
      .toEqual('<div class="container" id="successfulSubmission"><div class="govuk-box-highlight confirm-page new"><span class="hod-checkmark"></span><h2 class="heading-small">test</h2></div></div>')
  });
});
