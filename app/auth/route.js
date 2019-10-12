import Route from '@ember/routing/route'
import resetScroll from 'radio4000/mixins/reset-scroll'
import firebase from 'firebase/app'
import {debug} from '@ember/debug'
import { get } from '@ember/object'
import {inject as service} from '@ember/service'

export default Route.extend(resetScroll, {
	flashMessages: service(),
	firebaseApp: service(),
	session: service(),

	onLoginError(err) {
		const messages = get(this, 'flashMessages')
		let msg

		if (err.code === 'auth/email-not-verified') {
			msg = 'This email address is not verified. Check your inbox.'
			this.transitionTo('auth.login')
		} else if (err.code === 'auth/invalid-email') {
			msg = 'Invalid email.'
		} else if (err.code === 'auth/user-disabled') {
			msg = 'This account has been disabled. Contact an admin.'
		} else if (err.code === 'auth/user-not-found') {
			msg = 'This account does not exist.'
		} else if (err.code === 'auth/wrong-password') {
			msg = 'Password and email do not match.'
		} else if (err.code === 'auth/internal-error') {
			msg = 'Internal error, please try again later.'
			debug(`auth/internal-error: ${err}`)
		} else {
			debug(`Login error is not referenced: ${err}`)
		}

		if (msg) {
			messages.warning(msg, {timeout: 10000})
		}
	},

	actions: {
		async login(providerName, email, password) {
			const flashMessages = get(this, 'flashMessages')
			const auth = await get(this, 'firebaseApp').auth()

			const providers = {
				google: firebase.auth.GoogleAuthProvider,
				facebook: firebase.auth.FacebookAuthProvider,
				password: function () {}
			}
			const provider = new providers[providerName]()

			// Decide whether to use popup or redirect.
			// iOS has issues with the default 'popup' method, so we switch to redirect.
			const iOS =
				Boolean(navigator.platform) && /iPhone|iPod/.test(navigator.platform)

			console.log('login', {providerName})

			try {
				let result
				if (providerName === 'password') {
					result = await auth.signInWithEmailAndPassword(email, password)
				} else if (iOS) {
					result = await auth.signInWithRedirect(provider)
				} else {
					result = await auth.signInWithPopup(provider)
				}
				console.log({result})
				flashMessages.info('You are now signed in!')
				this.send('redirectAfterAuth')
			} catch (err) {
				this.onLoginError(err)
			}
		},
		async redirectAfterAuth() {
			console.log('afterauth?!?!')
		}
	}
})
