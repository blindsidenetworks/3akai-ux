/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery','oae.core'], function($, oae) {

    // Get the meeting id from the URL. The expected URL is `/meeting/<tenantId>/<resourceId>`.
    // The meeting id will then be `d:<tenantId>:<resourceId>`
    var meetingId = 'd:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the meeting's base URL
    var baseUrl = '/meeting/' + $.url().segment(2) + '/' + $.url().segment(3);

    // Variable used to cache the requested meeting profile
    var meetingProfile = null;

    /**
     * Set up the left hand navigation with the meeting space page structure.
     * The meeting left hand navigation item will not be shown to the user and
     * is only used to load the meeting topic
     */
    var setUpNavigation = function() {
        var lhNavPages = [{
            'id': 'meeting',
            'title': meetingProfile.displayName,
            'icon': 'fa-video-camera',
            'closeNav': true,
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'meeting',
                            'settings': meetingProfile
                        }
                    ]
                },
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'comments'
                        }
                    ]
                }
            ]
        }];

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
        });
    };


    ///////////////////////////////////////
    // MEETING PROFILE INITIALIZATION //
    ///////////////////////////////////////

    /**
     * Get the meeting's basic profile and set up the screen. If the meeting
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getMeetingProfile = function() {
        oae.api.meeting.getMeeting(meetingId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            // Cache the meeting profile data
            meetingProfile = profile;
            // Render the entity information
            setUpClip();
            // Set up the page
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
            // Set up the meeting push notifications
            setUpPushNotifications();
        });
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. meeting profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, meetingProfile);
            } else {
                $(document).trigger('oae.context.send', meetingProfile);
            }
        });
        $(document).trigger('oae.context.send', meetingProfile);
    };

    /**
     * Render the meeting clip
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#meeting-clip-template'), {
            'meeting': meetingProfile,
            'displayOptions': {
                'addLink': false
            }
        }, $('#meeting-clip-container'));
    };

    /**
     * Subscribe to meeting activity push notifications, allowing for updating the meeting profile when changes to the meeting
     * are made by a different user after the initial page load
     */
    var setUpPushNotifications = function() {
        oae.api.push.subscribe(meetingId, 'activity', meetingProfile.signature, 'internal', false, false, function(activities) {
            // The `activity` stream pushes out activities on routing so it's always
            // safe to just pick the first item from the `activities` array
            var activity = activities[0];

            var supportedActivities = ['meeting-update', 'meeting-update-visibility'];
            // Only respond to push notifications caused by other users
            if (activity.actor.id !== oae.data.me.id && _.contains(supportedActivities, activity['oae:activityType'])) {
                activity.object.canShare = meetingProfile.canShare;
                activity.object.canPost = meetingProfile.canPost;
                activity.object.isManager = meetingProfile.isManager;

                // Trigger an edit meeting event so the UI can update itself where appropriate
                $(document).trigger('oae.editmeeting.done', activity.object);
            }
        });
    };


    ///////////////////
    // MANAGE ACCESS //
    ///////////////////

    /**
     * Create the widgetData object to send to the manageaccess widget that contains all
     * variable values needed by the widget.
     *
     * @return {Object}    The widgetData to be passed into the manageaccess widget
     * @see manageaccess#initManageAccess
     */
    var getManageAccessData = function() {
        return {
            'contextProfile': meetingProfile,
            'messages': {
                'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__MEETING_ACCESS_COULD_NOT_BE_UPDATED__'),
                'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__MEETING_ACCESS_NOT_UPDATED__'),
                'accessUpdatedBody': oae.api.i18n.translate('__MSG__MEETING_ACCESS_SUCCESSFULLY_UPDATED__'),
                'accessUpdatedTitle': oae.api.i18n.translate('__MSG__MEETING_ACCESS_UPDATED__'),
                'membersTitle': oae.api.i18n.translate('__MSG__SHARE_WITH__'),
                'private': oae.api.i18n.translate('__MSG__PRIVATE__'),
                'loggedin': oae.api.util.security().encodeForHTML(meetingProfile.tenant.displayName),
                'public': oae.api.i18n.translate('__MSG__PUBLIC__'),
                'privateDescription': oae.api.i18n.translate('__MSG__MEETING_PRIVATE_DESCRIPTION__'),
                'loggedinDescription': oae.api.i18n.translate('__MSG__MEETING_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(meetingProfile.tenant.displayName)}),
                'publicDescription': oae.api.i18n.translate('__MSG__MEETING_PUBLIC_DESCRIPTION__')
            },
            'defaultRole': 'member',
            'roles': [
                {'id': 'member', 'name': oae.api.i18n.translate('__MSG__CAN_VIEW__')},
                {'id': 'manager', 'name': oae.api.i18n.translate('__MSG__CAN_MANAGE__')}
            ],
            'api': {
                'getMembersURL': '/api/meeting/'+ meetingProfile.id + '/members',
                'setMembers': oae.api.meeting.updateMembers,
                'setVisibility': oae.api.meeting.updateMeeting
            }
        };
    };

    /**
     * Trigger the manageaccess widget and pass in context data
     */
    $(document).on('click', '.meeting-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Trigger the manageaccess widget in `add members` view and pass in context data
     */
    $(document).on('click', '.meeting-trigger-manageaccess-add', function() {
        $(document).trigger('oae.trigger.manageaccess-add', getManageAccessData());
    });

    /**
     * Re-render the meeting's clip when the permissions have been updated
     */
    $(document).on('oae.manageaccess.done', setUpClip);


    /////////////////////
    // EDIT MEETING //
    /////////////////////

    /**
     * Refresh the meeting topic by emptying the existing meeting topic container and
     * rendering a new one
     */
    var refreshMeetingTopic = function() {
        // Empty the preview container
        var $widgetContainer = $('#lhnavigation-widget-meeting');
        $widgetContainer.empty();

        // Insert the new updated meeting widget
        oae.api.widget.insertWidget('meeting', null, $widgetContainer, null, meetingProfile);
    };

    /**
     * Refresh the meeting profile by updating the clips and meeting topic
     *
     * @param  {Meeting}        updatedMeeting          Meeting profile of the updated meeting item
     */
    var refreshMeetingProfile = function(updatedMeeting) {
        // Cache the meeting profile data
        meetingProfile = updatedMeeting;
        // Refresh the meeting topic
        refreshMeetingTopic();
        // Refresh the clip
        setUpClip();
    };

    // Catch the event sent out when the meeting has been updated
    $(document).on('oae.editmeeting.done', function(ev, updatedMeeting) {
        refreshMeetingProfile(updatedMeeting);
    });

    getMeetingProfile();

});
