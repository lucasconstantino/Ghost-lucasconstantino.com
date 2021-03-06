var SettingsUserController = Ember.ObjectController.extend({

    user: Ember.computed.alias('model'),

    email: Ember.computed.readOnly('user.email'),

    coverDefault: function () {
        return this.get('ghostPaths.url').asset('/shared/img/user-cover.png');
    }.property('ghostPaths'),

    userDefault: function () {
        return this.get('ghostPaths.url').asset('/shared/img/user-image.png');
    }.property('ghostPaths'),

    cover: function () {
        var cover = this.get('user.cover');
        if (Ember.isBlank(cover)) {
            cover = this.get('coverDefault');
        }
        return cover;
    }.property('user.cover', 'coverDefault'),

    coverTitle: function () {
        return this.get('user.name') + '\'s Cover Image';
    }.property('user.name'),

    image: function () {
        return  'background-image: url(' + this.get('imageUrl') + ')';
    }.property('imageUrl'),

    imageUrl: function () {
        return this.get('user.image') || this.get('userDefault');
    }.property('user.image'),

    last_login: function () {
        var lastLogin = this.get('user.last_login');

        return lastLogin ? lastLogin.fromNow() : '';

    }.property('user.last_login'),

    created_at: function () {
        var createdAt = this.get('user.created_at');

        return createdAt ? createdAt.fromNow() : '';
    }.property('user.created_at'),

    isAuthor: function () {
        return this.get('user.isAuthor');
    }.property('user.isAuthor'),

    actions: {
        revoke: function () {
            var self = this,
                email = this.get('email');

            this.get('model').destroyRecord().then(function () {
                var notificationText = 'Invitation revoked. (' + email + ')';
                self.notifications.showSuccess(notificationText, false);
            }).catch(function (error) {
                self.notifications.closePassive();
                self.notifications.showAPIError(error);
            });
        },

        resend: function () {
            var self = this;

            this.get('model').resendInvite().then(function (result) {
                var notificationText = 'Invitation resent! (' + self.get('email') + ')';
                // If sending the invitation email fails, the API will still return a status of 201
                // but the user's status in the response object will be 'invited-pending'.
                if (result.users[0].status === 'invited-pending') {
                    self.notifications.showWarn('Invitation email was not sent.  Please try resending.');
                } else {
                    self.get('model').set('status', result.users[0].status);
                    self.notifications.showSuccess(notificationText, false);
                }
            }).catch(function (error) {
                self.notifications.closePassive();
                self.notifications.showAPIError(error);
            });
        },

        save: function () {
            var user = this.get('user'),
                self = this;

            user.save({ format: false }).then(function (model) {
                self.notifications.closePassive();
                self.notifications.showSuccess('Settings successfully saved.');

                return model;
            }).catch(function (errors) {
                self.notifications.closePassive();
                self.notifications.showErrors(errors);
            });
        },

        password: function () {
            var user = this.get('user'),
                self = this;

            if (user.get('isPasswordValid')) {
                user.saveNewPassword().then(function (model) {

                    // Clear properties from view
                    user.setProperties({
                        'password': '',
                        'newPassword': '',
                        'ne2Password': ''
                    });

                    self.notifications.closePassive();
                    self.notifications.showSuccess('Password updated.');

                    return model;
                }).catch(function (errors) {
                    self.notifications.closePassive();
                    self.notifications.showAPIError(errors);
                });
            } else {
                self.notifications.showErrors(user.get('passwordValidationErrors'));
            }
        }
    }
});

export default SettingsUserController;
