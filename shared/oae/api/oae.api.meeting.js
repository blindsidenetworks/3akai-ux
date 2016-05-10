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

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Get a full meeting profile
     *
     * @param  {String}       meetingId             Id of the meeting we're trying to retrieve
     * @param  {Function}     callback              Standard callback function
     * @param  {Object}       callback.err          Error object containing error code and error message
     * @param  {Meeting}      callback.meeting      Meeting object representing the retrieved meeting
     * @throws {Error}                              Error thrown when no meeting id has been provided
     */
    var getMeeting = exports.getMeeting = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        $.ajax({
            'url': '/api/meeting/' + meetingId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new meeting
     *
     * @param  {String}         displayName               Topic for the meeting
     * @param  {String}         [description]             The meeting's description
     * @param  {String}         [record]       		        Flag indicating that the meeting may be recorded
     * @param  {String}         [allModerators]           Flag indicating that all users join as moderators
     * @param  {String}         [waitModerator]           Flag indicating that viewers must wait until a moderator joins
     * @param  {String}         [visibility]              The meeting's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]                Array of user/group ids that should be added as managers to the meeting
     * @param  {String[]}       [members]                 Array of user/group ids that should be added as members to the meeting
     * @param  {Function}       [callback]                Standard callback function
     * @param  {Object}         [callback.err]            Error object containing error code and error message
     * @param  {Meeting}        [callback.meeting]        Meeting object representing the created meeting
     * @throws {Error}                                    Error thrown when no meeting topic has been provided
     */
    var createMeeting = exports.createMeeting = function(displayName, description, record, allModerators, waitModerator, visibility, managers, members, callback) {
        if (!displayName) {
            throw new Error('A valid description topic should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'record': record,
            'allModerators': allModerators,
            'waitModerator': waitModerator,
            'visibility': visibility,
            'managers': managers,
            'members': members
        };

        $.ajax({
            'url': '/api/meeting/create',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update a meeting's metadata
     *
     * @param  {String}       meetingId                   Id of the meeting we're trying to update
     * @param  {Object}       params                      JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]                  Standard callback function
     * @param  {Object}       [callback.err]              Error object containing error code and error message
     * @param  {Meeting}      [callback.meeting]          Meeting object representing the updated meeting
     * @throws {Error}                                    Error thrown when not all of the required parameters have been provided
     */
    var updateMeeting = exports.updateMeeting = function(meetingId, params, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/' + meetingId,
            'type': 'POST',
            'data': params,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Start a meeting
     *
     * @param  {String}       meetingId                   Id of the meeting we're trying to start
     * @param  {Function}     [callback]                  Standard callback function
     * @param  {Object}       [callback.err]              Error object containing error code and error message
     * @throws {Error}                                    Error thrown when not all of the required parameters have been provided
     */
    var startMeeting = exports.startMeeting = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/' + meetingId + '/start',
            'type': 'POST',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Permanently delete a meeting from the system
     *
     * @param  {String}        meetingId             Id of the meeting we're trying to delete
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var deleteMeeting = exports.deleteMeeting = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/' + meetingId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the viewers and managers of a meeting
     *
     * @param  {String}          meetingId                      Id of the meeting we're trying to retrieve the members for
     * @param  {String}          [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}          [limit]                        The number of members to retrieve
     * @param  {Function}        callback                       Standard callback function
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.members               Response object containing the meeting members and nextToken
     * @param  {User[]|Group[]}  callback.members.results       Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @param  {String}          callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no meeting id has been provided
     */
    var getMembers = exports.getMembers = function(meetingId, start, limit, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/meeting/'+ meetingId + '/members',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Change the members and managers of a meeting
     *
     * @param  {String}       meetingId             Id of the meeting we're trying to update the members of
     * @param  {Object}       updatedMembers        JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]            Standard callback function
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(meetingId, updatedMembers, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/'+ meetingId + '/members',
            'type': 'POST',
            'data': updatedMembers,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Share a meeting
     *
     * @param  {String}       meetingId             Id of the meeting we're trying to share
     * @param  {String[]}     principals            Array of principal ids with who the meeting should be shared
     * @param  {Function}     [callback]            Standard callback function
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var shareMeeting = exports.shareMeeting = function(meetingId, principals, callback) {
        if (!meetingId) {
            throw new Error('A meeting id should be provided');
        } else if (!principals.length) {
            throw new Error('A user or group to share with should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'members': principals
        };

        $.ajax({
            'url': '/api/meeting/' + meetingId + '/share',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the meeting library for a given principal
     *
     * @param  {String}         principalId                     User or group id for who we want to retrieve the meetings library
     * @param  {String}         [start]                         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                         The number of meetings to retrieve
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.meetings               Response object containing the meetings in the requested library and nextToken
     * @param  {Meeting[]}      callback.meetings.results       Array of meetings representing the meetings present in the library
     * @param  {String}         callback.meetings.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no principal id has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/meeting/library/' + principalId,
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete a meeting from a meeting library
     *
     * @param  {String}         principalId       User or group id for for the library from which we want to delete the content
     * @param  {String}         meetingId         Id of the meeting we're trying to delete from the library
     * @param  {Function}       [callback]        Standard callback function
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteMeetingFromLibrary = exports.deleteMeetingFromLibrary = function(principalId, meetingId, callback) {
        if (!principalId) {
            throw new Error('A valid user or group id should be provided');
        } else if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/library/' + principalId + '/' + meetingId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Execute end meeting to kick out all the users and close the meeting
     *
     * @param  {String}        meetingId             Id of the meeting we're trying to end
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var endMeeting = exports.endMeeting = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/' + meetingId + '/end',
            'type': 'GET',
            'success': function(data) {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Execute end meeting to kick out all the users and close the meeting
     *
     * @param  {String}        meetingId             Id of the meeting we're trying to fetch
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var infoMeeting = exports.infoMeeting = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting/' + meetingId + '/info',
            'type': 'GET',
            'success': function(response) {
                callback(null, response);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText}, null);
            }
        });
    };

    /**
     * Execute get recordings to fetch the recordings belonging to a meeting
     *
     * @param  {String}        meetingId             Id(s) of the meeting(s) we're trying to get recordings from
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var getRecording = exports.getRecording = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/recording/' + meetingId,
            'type': 'GET',
            'success': function(response) {
                console.info('Success');
                callback(null, response);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText}, null);
            },
            'statusCode': {
                404:  function() {
                    console.info('No recording found');
                }
            }
        });
    };

    /**
     * Execute to update recordings info
     *
     * @param  {String}        recordingId           Id of the recording to update
     * @param  {String}        publish               The value of publish true or false
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var updateRecording = exports.updateRecording = function(recordingId, publish, callback) {
        if (!recordingId) {
            throw new Error('A valid recording id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/recording/' + recordingId,
            'type': 'PATCH',
            'data':{'publish': !publish},
            'success': function(response) {
                console.info('Success');
                callback(null, response);
            },
            'error': function(jqXHR, textStatus) {
                console.info('Error');
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText}, null);
            }
        });
    };

    /**
     * Execute delete recordings to delete the recording from database
     *
     * @param  {String}        recordingId           Id of the recording to delete
     * @param  {Function}      [callback]            Standard callback function
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid meeting id has been provided
     */
    var deleteRecording = exports.deleteRecording = function(recordingId, callback) {
        if (!recordingId) {
            throw new Error('A valid recording id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/recording/' + recordingId,
            'type': 'DELETE',
            'success': function(response) {
                console.info('Success');
                callback(null, response);
            },
            'error': function(jqXHR, textStatus) {
                console.info('Error');
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText}, null);
            }
        });
    };

    /**
     * Get all the invitations for a meeting
     *
     * @param  {String}         meetingId                       Id of the meeting we're trying to retrieve the invitations for
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.invitations            Response object containing the meeting invitations
     * @param  {Invitation[]}   callback.invitations.results    Every invitation associated to the meeting
     * @throws {Error}                                          Error thrown when no meeting id has been provided
     */
    var getInvitations = exports.getInvitations = function(meetingId, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        $.ajax({
            'url': '/api/meeting/'  + meetingId + '/invitations',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Resend an invitation that invites an email into a meeting
     *
     * @param  {String}     meetingId    Id of the meeting whose invitation to resend
     * @param  {String}     email           The email of the invitation to resend
     * @param  {Function}   callback        Standard callback function
     * @param  {Object}     callback.err    Error object containing error code and error message
     * @throws {Error}                      Error thrown when no meeting id has been provided
     */
    var resendInvitation = exports.resendInvitation = function(meetingId, email, callback) {
        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        $.ajax({
            'url': '/api/meeting/' + meetingId + '/invitations/' + email + '/resend',
            'type': 'POST',
            'success': function() {
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
