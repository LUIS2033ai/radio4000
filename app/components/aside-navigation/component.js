import Ember from 'ember';

const {Component, get, inject} = Ember;

export default Component.extend({
	uiStates: inject.service(),
	player: inject.service(),
	session: inject.service(),
	tagName: 'aside',
	ariaRole: 'navigation',
	replace: true,

	actions: {
		addTrack(trackModel) {
			get(this, 'onClick')(trackModel);
		},
		openShortcutsModal() {
			this.set('uiStates.showShortcutsModal', true)
		}
	}
});
